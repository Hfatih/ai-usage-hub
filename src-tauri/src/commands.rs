use std::{path::Path, process::Command, sync::atomic::Ordering};

use tauri::{AppHandle, State};
use tauri_plugin_autostart::ManagerExt;

use crate::{
    detector::{resolve_executable, valid_application_path},
    error::{HubError, Result},
    models::{
        AccountSummary, ActivityEvent, AppSettings, DashboardSnapshot, SecurityStatus,
        UsageHistoryPoint,
    },
    refresh_all, update_tray_language, HubState,
};

#[tauri::command]
pub fn get_dashboard(state: State<'_, HubState>) -> Result<DashboardSnapshot> {
    state.snapshot()
}

#[tauri::command(async)]
pub fn refresh_processes(state: State<'_, HubState>) -> Result<DashboardSnapshot> {
    refresh_all(&state, true).map(|(snapshot, _)| snapshot)
}

#[tauri::command]
pub fn get_activity(state: State<'_, HubState>) -> Result<Vec<ActivityEvent>> {
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .activity(100)
}

#[tauri::command]
pub fn get_accounts(state: State<'_, HubState>) -> Result<Vec<AccountSummary>> {
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .accounts()
}

#[tauri::command]
pub fn delete_account(state: State<'_, HubState>, account_id: String) -> Result<bool> {
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .delete_account(&account_id)
}

#[tauri::command]
pub fn get_usage_history(state: State<'_, HubState>) -> Result<Vec<UsageHistoryPoint>> {
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .usage_history(250)
}

#[tauri::command]
pub fn get_notifications(state: State<'_, HubState>) -> Result<Vec<ActivityEvent>> {
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .notifications(100)
}

#[tauri::command]
pub fn get_security_status(state: State<'_, HubState>) -> Result<SecurityStatus> {
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .security_status()
}

#[tauri::command]
pub fn clear_usage_history(state: State<'_, HubState>) -> Result<usize> {
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .clear_usage_history()
}

#[tauri::command]
pub fn get_settings(state: State<'_, HubState>) -> Result<AppSettings> {
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .settings()
}

#[tauri::command]
pub fn update_settings(
    app: AppHandle,
    state: State<'_, HubState>,
    mut settings: AppSettings,
) -> Result<AppSettings> {
    settings.refresh_interval_seconds = settings.refresh_interval_seconds.clamp(3, 300);
    settings.notify_warning_percent = settings.notify_warning_percent.clamp(1, 99);
    settings.notify_critical_percent = settings
        .notify_critical_percent
        .clamp(1, settings.notify_warning_percent);
    if !matches!(settings.close_behavior.as_str(), "tray" | "quit") {
        return Err(HubError::Configuration(
            "close behavior must be 'tray' or 'quit'".into(),
        ));
    }
    if !matches!(settings.theme.as_str(), "dark" | "light" | "system") {
        return Err(HubError::Configuration("unsupported theme".into()));
    }
    if !matches!(settings.language.as_str(), "tr" | "en") {
        return Err(HubError::Configuration("unsupported language".into()));
    }

    let autostart = app.autolaunch();
    if settings.launch_at_startup {
        autostart
            .enable()
            .map_err(|error| HubError::Operation(error.to_string()))?;
    } else {
        autostart
            .disable()
            .map_err(|error| HubError::Operation(error.to_string()))?;
    }
    state
        .paused
        .store(!settings.process_monitoring, Ordering::Relaxed);
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .save_settings(&settings)?;
    if let Err(error) = update_tray_language(&app, &settings.language) {
        tracing::warn!(%error, "could not update tray language");
    }
    Ok(settings)
}

#[tauri::command]
pub fn set_monitoring_paused(state: State<'_, HubState>, paused: bool) -> bool {
    state.paused.store(paused, Ordering::Relaxed);
    paused
}

#[tauri::command]
pub fn set_app_executable(
    state: State<'_, HubState>,
    app_id: String,
    executable_path: String,
) -> Result<()> {
    let canonical = std::fs::canonicalize(&executable_path)?;
    if !valid_application_path(&canonical) {
        #[cfg(target_os = "windows")]
        let message = "select a valid Windows .exe file";
        #[cfg(target_os = "macos")]
        let message = "select a macOS .app bundle or executable file";
        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        let message = "select a valid executable file";
        return Err(HubError::Configuration(
            message.into(),
        ));
    }
    let path = canonical.to_string_lossy();
    state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .set_executable(&app_id, &path)
}

#[tauri::command]
pub fn launch_app(state: State<'_, HubState>, app_id: String) -> Result<()> {
    launch(&state, &app_id)
}

pub fn launch(state: &HubState, app_id: &str) -> Result<()> {
    let definition = state
        .database
        .lock()
        .map_err(|_| HubError::Operation("database lock is unavailable".into()))?
        .application(app_id)?
        .ok_or_else(|| HubError::AppNotFound(app_id.into()))?;
    let executable =
        resolve_executable(&definition).ok_or_else(|| HubError::NotLaunchable(app_id.into()))?;
    spawn_hidden(&executable, &definition.launch_arguments)
}

fn spawn_hidden(executable: &Path, arguments: &[String]) -> Result<()> {
    #[cfg(target_os = "macos")]
    if executable.is_dir() {
        let mut command = Command::new("/usr/bin/open");
        command.arg("-a").arg(executable);
        if !arguments.is_empty() {
            command.arg("--args").args(arguments);
        }
        command.spawn()?;
        return Ok(());
    }

    let mut command = Command::new(executable);
    command.args(arguments);
    if let Some(parent) = executable.parent() {
        command.current_dir(parent);
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x0800_0000);
    }
    command.spawn()?;
    Ok(())
}
