import { create } from "zustand";
import { api } from "../lib/ipc";
import type { AccountSummary, ActivityEvent, AppSettings, DashboardSnapshot, SecurityStatus, UsageHistoryPoint } from "../types";

interface HubState {
  snapshot: DashboardSnapshot | null;
  settings: AppSettings | null;
  activity: ActivityEvent[];
  accounts: AccountSummary[];
  usageHistory: UsageHistoryPoint[];
  notifications: ActivityEvent[];
  security: SecurityStatus | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  loadActivity: () => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  clearUsageHistory: () => Promise<void>;
}

export const useHub = create<HubState>((set) => ({
  snapshot: null,
  settings: null,
  activity: [],
  accounts: [],
  usageHistory: [],
  notifications: [],
  security: null,
  loading: true,
  refreshing: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const [snapshot, settings, accounts, usageHistory, notifications, security] = await Promise.all([
        api.dashboard(), api.settings(), api.accounts(), api.usageHistory(), api.notifications(), api.security(),
      ]);
      set({ snapshot, settings, accounts, usageHistory, notifications, security, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },
  refresh: async () => {
    set({ refreshing: true, error: null });
    try {
      const snapshot = await api.refresh();
      const [accounts, usageHistory, notifications, security] = await Promise.all([
        api.accounts(), api.usageHistory(), api.notifications(), api.security(),
      ]);
      set({ snapshot, accounts, usageHistory, notifications, security, refreshing: false });
    } catch (error) {
      set({ error: String(error), refreshing: false });
    }
  },
  loadActivity: async () => set({ activity: await api.activity() }),
  saveSettings: async (settings) => set({ settings: await api.saveSettings(settings) }),
  deleteAccount: async (accountId) => {
    await api.deleteAccount(accountId);
    const [accounts, usageHistory, security] = await Promise.all([api.accounts(), api.usageHistory(), api.security()]);
    set({ accounts, usageHistory, security });
  },
  clearUsageHistory: async () => {
    await api.clearUsageHistory();
    const [accounts, usageHistory, notifications, security] = await Promise.all([
      api.accounts(), api.usageHistory(), api.notifications(), api.security(),
    ]);
    set({ accounts, usageHistory, notifications, security });
  },
}));
