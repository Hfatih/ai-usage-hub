use std::path::{Path, PathBuf};

use sysinfo::{ProcessRefreshKind, ProcessesToUpdate, System};

use crate::models::{AppStatus, ApplicationDefinition, RunningState};

pub struct ProcessDetector {
    system: System,
}

impl ProcessDetector {
    pub fn new() -> Self {
        Self {
            system: System::new(),
        }
    }

    pub fn scan(&mut self, apps: &[ApplicationDefinition]) -> Vec<AppStatus> {
        self.system.refresh_processes_specifics(
            ProcessesToUpdate::All,
            true,
            ProcessRefreshKind::nothing()
                .with_exe(sysinfo::UpdateKind::OnlyIfNotSet)
                .with_cmd(sysinfo::UpdateKind::Always),
        );

        apps.iter()
            .map(|app| {
                let matched = self.system.processes().values().find(|process| {
                    let name = process.name().to_string_lossy();
                    let executable = process.exe();
                    let command = process
                        .cmd()
                        .iter()
                        .map(|part| part.to_string_lossy())
                        .collect::<Vec<_>>()
                        .join(" ");
                    process_matches(app, &name, executable, &command)
                });
                let detected_name =
                    matched.map(|process| process.name().to_string_lossy().into_owned());
                let configured = resolve_executable(app);

                AppStatus {
                    id: app.id.clone(),
                    provider_id: app.provider_id.clone(),
                    display_name: app.display_name.clone(),
                    state: if matched.is_some() {
                        RunningState::Running
                    } else {
                        RunningState::NotRunning
                    },
                    detected_executable: detected_name,
                    executable_path: configured
                        .as_ref()
                        .map(|path| path.to_string_lossy().into_owned()),
                    running_since: None,
                    current_session_seconds: 0,
                    today_seconds: 0,
                    week_seconds: 0,
                    last_used_at: None,
                    launchable: configured.is_some(),
                }
            })
            .collect()
    }
}

pub fn process_matches(
    app: &ApplicationDefinition,
    process_name: &str,
    executable_path: Option<&Path>,
    command_line: &str,
) -> bool {
    let normalized = process_name.to_ascii_lowercase();
    let executable = executable_path
        .map(|path| path.to_string_lossy().to_ascii_lowercase())
        .unwrap_or_default();
    let command = command_line.to_ascii_lowercase();
    let is_claude_process = matches!(normalized.as_str(), "claude.exe" | "claude");
    let is_claude_code = executable.contains("\\claude-code\\")
        || executable.contains("/claude-code/")
        || command.contains("@anthropic-ai\\claude-code")
        || command.contains("@anthropic-ai/claude-code")
        || command.contains("\\claude-code\\")
        || (cfg!(target_os = "macos")
            && process_name == "claude"
            && !executable.contains(".app/contents/macos/"));
    if app.id == "claude-code" && is_claude_process {
        return is_claude_code;
    }
    if app.id == "claude" && is_claude_process {
        return !is_claude_code;
    }
    if cfg!(target_os = "macos")
        && app.id == "gemini"
        && normalized == "gemini"
        && executable.contains(".app/contents/macos/")
    {
        return false;
    }

    if app
        .process_names
        .iter()
        .any(|candidate| candidate.eq_ignore_ascii_case(&normalized))
    {
        return true;
    }

    matches!(
        app.id.as_str(),
        "claude-code" | "gemini" | "codex" | "opencode"
    ) && matches!(normalized.as_str(), "node.exe" | "node")
        && command.contains(match app.id.as_str() {
            "claude-code" => "claude-code",
            "gemini" => "gemini",
            "codex" => "@openai/codex",
            _ => "opencode",
        })
}

pub fn resolve_executable(app: &ApplicationDefinition) -> Option<PathBuf> {
    if let Some(path) = app
        .executable_path
        .as_ref()
        .map(PathBuf::from)
        .filter(|path| valid_application_path(path))
    {
        return Some(path);
    }

    known_candidates(&app.id)
        .into_iter()
        .find(|path| valid_application_path(path))
}

pub fn valid_application_path(path: &Path) -> bool {
    #[cfg(target_os = "windows")]
    {
        path.is_file()
            && path
                .extension()
                .is_some_and(|extension| extension.eq_ignore_ascii_case("exe"))
    }
    #[cfg(target_os = "macos")]
    {
        use std::os::unix::fs::PermissionsExt;

        (path.is_dir()
            && path.extension().is_some_and(|extension| extension == "app")
            && path.join("Contents/Info.plist").is_file())
            || (path.is_file()
                && path
                    .metadata()
                    .is_ok_and(|metadata| metadata.permissions().mode() & 0o111 != 0))
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        path.is_file()
    }
}

#[cfg(target_os = "windows")]
fn known_candidates(app_id: &str) -> Vec<PathBuf> {
    let local = std::env::var_os("LOCALAPPDATA").map(PathBuf::from);
    let programs = std::env::var_os("ProgramFiles").map(PathBuf::from);
    let mut paths = Vec::new();
    let relative: &[&str] = match app_id {
        "codex" => &[
            "Programs/Codex/Codex.exe",
            "Programs/OpenAI Codex/Codex.exe",
        ],
        "chatgpt" => &["Programs/ChatGPT/ChatGPT.exe"],
        "claude" => &["Programs/Claude/Claude.exe", "AnthropicClaude/Claude.exe"],
        "antigravity" => &[
            "Programs/Antigravity/Antigravity.exe",
            "Programs/Antigravity IDE/Antigravity IDE.exe",
        ],
        "cursor" => &["Programs/cursor/Cursor.exe"],
        "vscode" => &["Programs/Microsoft VS Code/Code.exe"],
        "kimi" => &["Programs/Kimi/Kimi.exe"],
        _ => &[],
    };
    if let Some(root) = local {
        paths.extend(relative.iter().map(|path| root.join(path)));
    }
    if let Some(root) = programs {
        let global: &[&str] = match app_id {
            "vscode" => &["Microsoft VS Code/Code.exe"],
            "cursor" => &["Cursor/Cursor.exe"],
            _ => &[],
        };
        paths.extend(global.iter().map(|path| root.join(path)));
    }
    paths
}

#[cfg(target_os = "macos")]
fn known_candidates(app_id: &str) -> Vec<PathBuf> {
    let names: &[&str] = match app_id {
        "codex" => &["Codex.app"],
        "chatgpt" => &["ChatGPT.app"],
        "claude" => &["Claude.app"],
        "antigravity" => &["Antigravity.app"],
        "cursor" => &["Cursor.app"],
        "vscode" => &["Visual Studio Code.app"],
        "kimi" => &["Kimi.app"],
        "opencode" => &["OpenCode.app"],
        _ => &[],
    };
    let mut paths = Vec::new();
    for root in [
        Some(PathBuf::from("/Applications")),
        std::env::var_os("HOME").map(|home| PathBuf::from(home).join("Applications")),
    ]
    .into_iter()
    .flatten()
    {
        paths.extend(names.iter().map(|name| root.join(name)));
    }
    let command = match app_id {
        "claude-code" => Some("claude"),
        "gemini" => Some("gemini"),
        "codex" => Some("codex"),
        "opencode" => Some("opencode"),
        _ => None,
    };
    if let Some(command) = command {
        for root in ["/opt/homebrew/bin", "/usr/local/bin"] {
            paths.push(PathBuf::from(root).join(command));
        }
        if let Some(home) = std::env::var_os("HOME") {
            paths.push(PathBuf::from(home).join(".local/bin").join(command));
        }
    }
    paths
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
fn known_candidates(_app_id: &str) -> Vec<PathBuf> {
    Vec::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn definition(id: &str, names: &[&str]) -> ApplicationDefinition {
        ApplicationDefinition {
            id: id.into(),
            provider_id: None,
            display_name: id.into(),
            executable_path: None,
            launch_arguments: vec![],
            process_names: names.iter().map(|name| (*name).into()).collect(),
        }
    }

    #[test]
    fn process_names_match_case_insensitively_but_not_partially() {
        let app = definition("codex", &["Codex.exe"]);
        assert!(process_matches(&app, "CODEX.EXE", None, ""));
        assert!(!process_matches(&app, "codex-helper.exe", None, ""));
    }

    #[test]
    fn cli_wrappers_are_detected_from_node_command_lines() {
        let app = definition("claude-code", &["claude-code.exe"]);
        assert!(process_matches(
            &app,
            "node.exe",
            None,
            r#"node C:\npm\node_modules\@anthropic-ai\claude-code\cli.js"#
        ));
        assert!(!process_matches(&app, "node.exe", None, "node vite.js"));
    }

    #[test]
    fn claude_desktop_and_code_are_distinguished_by_executable_path() {
        let desktop = definition("claude", &["claude.exe"]);
        let code = definition("claude-code", &["claude-code.exe"]);
        let desktop_path = Path::new(r"C:\Users\me\AppData\Local\AnthropicClaude\app-2\claude.exe");
        let code_path = Path::new(r"C:\Users\me\AppData\Roaming\Claude\claude-code\2\claude.exe");

        assert!(process_matches(
            &desktop,
            "claude.exe",
            Some(desktop_path),
            ""
        ));
        assert!(!process_matches(
            &code,
            "claude.exe",
            Some(desktop_path),
            ""
        ));
        assert!(process_matches(&code, "claude.exe", Some(code_path), ""));
        assert!(!process_matches(
            &desktop,
            "claude.exe",
            Some(code_path),
            ""
        ));
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn mac_claude_desktop_and_cli_are_distinguished() {
        let desktop = definition("claude", &["Claude"]);
        let code = definition("claude-code", &["claude"]);
        let app = Path::new("/Applications/Claude.app/Contents/MacOS/Claude");
        let cli = Path::new("/Users/me/.local/bin/claude");
        assert!(process_matches(&desktop, "Claude", Some(app), ""));
        assert!(!process_matches(&code, "Claude", Some(app), ""));
        assert!(process_matches(&code, "claude", Some(cli), ""));
        assert!(!process_matches(&desktop, "claude", Some(cli), ""));
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn mac_application_paths_require_a_bundle_or_executable_file() {
        use std::os::unix::fs::PermissionsExt;

        let root = tempfile::tempdir().unwrap();
        let app = root.path().join("Example.app");
        std::fs::create_dir_all(app.join("Contents")).unwrap();
        assert!(!valid_application_path(&app));
        std::fs::write(app.join("Contents/Info.plist"), b"plist").unwrap();
        assert!(valid_application_path(&app));

        let tool = root.path().join("tool");
        std::fs::write(&tool, b"#!/bin/sh\n").unwrap();
        assert!(!valid_application_path(&tool));
        std::fs::set_permissions(&tool, std::fs::Permissions::from_mode(0o755)).unwrap();
        assert!(valid_application_path(&tool));
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn gemini_cli_does_not_match_the_desktop_app() {
        let cli = definition("gemini", &["gemini"]);
        let app = Path::new("/Applications/Gemini.app/Contents/MacOS/Gemini");
        let executable = Path::new("/opt/homebrew/bin/gemini");
        assert!(!process_matches(&cli, "Gemini", Some(app), ""));
        assert!(process_matches(&cli, "gemini", Some(executable), ""));
    }

    #[cfg(target_os = "windows")]
    #[test]
    #[ignore = "requires running Claude Desktop and Antigravity apps"]
    fn live_windows_desktop_app_detection() {
        let apps = vec![
            definition("claude", &["claude.exe"]),
            definition("antigravity", &["antigravity.exe", "antigravity ide.exe"]),
        ];
        let statuses = ProcessDetector::new().scan(&apps);
        for status in statuses {
            assert_eq!(status.state, RunningState::Running, "{}", status.id);
        }
    }
}
