import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { AccountSummary, ActivityEvent, AppSettings, DashboardSnapshot, SecurityStatus, UsageHistoryPoint } from "../types";
import { developmentAccounts, developmentSecurity, developmentSettings, developmentSnapshot, developmentUsageHistory } from "./mock";

const inTauri = () => "__TAURI_INTERNALS__" in window;

async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!inTauri()) throw new Error("Desktop backend is not available in browser preview.");
  return invoke<T>(command, args);
}

export const api = {
  dashboard: (): Promise<DashboardSnapshot> =>
    inTauri() ? call("get_dashboard") : Promise.resolve(structuredClone(developmentSnapshot)),
  refresh: (): Promise<DashboardSnapshot> =>
    inTauri() ? call("refresh_processes") : Promise.resolve(structuredClone(developmentSnapshot)),
  activity: (): Promise<ActivityEvent[]> =>
    inTauri() ? call("get_activity") : Promise.resolve([]),
  accounts: (): Promise<AccountSummary[]> =>
    inTauri() ? call("get_accounts") : Promise.resolve(structuredClone(developmentAccounts)),
  deleteAccount: (accountId: string): Promise<boolean> =>
    inTauri() ? call("delete_account", { accountId }) : Promise.resolve(true),
  usageHistory: (): Promise<UsageHistoryPoint[]> =>
    inTauri() ? call("get_usage_history") : Promise.resolve(structuredClone(developmentUsageHistory)),
  notifications: (): Promise<ActivityEvent[]> =>
    inTauri() ? call("get_notifications") : Promise.resolve([]),
  security: (): Promise<SecurityStatus> =>
    inTauri() ? call("get_security_status") : Promise.resolve({ ...developmentSecurity }),
  clearUsageHistory: (): Promise<number> =>
    inTauri() ? call("clear_usage_history") : Promise.resolve(0),
  settings: (): Promise<AppSettings> =>
    inTauri() ? call("get_settings") : Promise.resolve({ ...developmentSettings }),
  saveSettings: (settings: AppSettings): Promise<AppSettings> =>
    inTauri() ? call("update_settings", { settings }) : Promise.resolve(settings),
  launchApp: (appId: string): Promise<void> => call("launch_app", { appId }),
  setMonitoringPaused: (paused: boolean): Promise<boolean> =>
    inTauri() ? call("set_monitoring_paused", { paused }) : Promise.resolve(paused),
  chooseExecutable: async (filterName: string): Promise<string | null> => {
    if (!inTauri()) return null;
    const result = await open({ multiple: false, filters: [{ name: filterName, extensions: ["exe"] }] });
    return typeof result === "string" ? result : null;
  },
  setExecutable: (appId: string, executablePath: string): Promise<void> =>
    call("set_app_executable", { appId, executablePath }),
};
