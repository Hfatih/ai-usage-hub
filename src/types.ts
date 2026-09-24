export type RunningState = "running" | "not_running" | "unknown";
export type UsageSource =
  | "official_api"
  | "official_cli"
  | "local_application"
  | "local_logs"
  | "locally_calculated"
  | "estimated"
  | "unavailable";
export type Confidence = "high" | "medium" | "low" | "unavailable";

export interface UsageValue {
  metric: string;
  label: string;
  value: number | null;
  maxValue: number | null;
  unit: string;
  source: UsageSource;
  confidence: Confidence;
  retrievedAt: number;
  resetAt: number | null;
}

export interface ProviderCapabilities {
  usagePercentage: boolean;
  resetTime: boolean;
  requestCount: boolean;
  tokenUsage: boolean;
  costTracking: boolean;
  localSessionDetection: boolean;
  oauth: boolean;
  multipleAccounts: boolean;
  appLaunch: boolean;
  rateLimitStatus: boolean;
}

export interface ProviderSummary {
  id: string;
  name: string;
  accountLabel: string;
  plan: string | null;
  connectionStatus: "connected" | "not_connected" | "error";
  capabilities: ProviderCapabilities;
  usage: UsageValue[];
  usageAllowed: boolean | null;
  lastRefresh: number | null;
  error: string | null;
}

export interface AppStatus {
  id: string;
  providerId: string | null;
  displayName: string;
  state: RunningState;
  detectedExecutable: string | null;
  executablePath: string | null;
  runningSince: number | null;
  currentSessionSeconds: number;
  todaySeconds: number;
  weekSeconds: number;
  lastUsedAt: number | null;
  launchable: boolean;
}

export interface DashboardSnapshot {
  providers: ProviderSummary[];
  applications: AppStatus[];
  refreshedAt: number;
  monitoringPaused: boolean;
}

export interface ActivityEvent {
  id: number;
  eventType: string;
  title: string;
  detail: string | null;
  severity: "info" | "success" | "warning" | "danger";
  createdAt: number;
}

export interface AccountSummary {
  id: string;
  providerId: string;
  providerName: string;
  email: string;
  plan: string | null;
  authMethod: string;
  connectionStatus: "connected" | "not_connected" | "error";
  lastRefresh: number | null;
  usage: UsageValue[];
}

export interface UsageHistoryPoint {
  id: number;
  accountId: string;
  providerId: string;
  providerName: string;
  accountLabel: string;
  usage: UsageValue;
}

export interface SecurityStatus {
  databasePath: string;
  databaseSizeBytes: number;
  accountCount: number;
  usageSnapshotCount: number;
}

export interface AppSettings {
  launchAtStartup: boolean;
  minimizeToTray: boolean;
  closeBehavior: "tray" | "quit";
  theme: "dark" | "light" | "system";
  language: string;
  processMonitoring: boolean;
  refreshIntervalSeconds: number;
  notificationsEnabled: boolean;
  notifyWarningPercent: number;
  notifyCriticalPercent: number;
  notifyOnReset: boolean;
  notifyOnProviderError: boolean;
}
