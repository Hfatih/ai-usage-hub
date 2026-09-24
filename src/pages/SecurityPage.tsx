import { Database, FileKey2, HardDrive, ShieldCheck, Trash2 } from "lucide-react";
import { localizeValue, useTranslation } from "../i18n";
import { useHub } from "../stores/hub";

export function SecurityPage() {
  const { language, t } = useTranslation();
  const { security, clearUsageHistory } = useHub();
  if (!security) return null;
  async function clear() {
    if (!window.confirm(t("Delete all local usage samples and usage alerts? Account records will be kept."))) return;
    await clearUsageHistory();
  }
  return <section><div className="page-heading"><div><span className="eyebrow">{t("Local privacy")}</span><h1>{t("Security")}</h1><p>{t("See what is stored, where it lives and how to clear it.")}</p></div></div>
    <div className="security-grid"><article className="glass-panel security-card"><ShieldCheck size={22} /><strong>{t("No provider secrets stored")}</strong><span>{t("{count} passwords, tokens or API keys in this database.", { count: security.storedSecretCount })}</span></article><article className="glass-panel security-card"><Database size={22} /><strong>{t(security.accountCount === 1 ? "{count} saved account security" : "{count} saved accounts security", { count: security.accountCount })}</strong><span>{t("{count} verified usage samples", { count: security.usageSnapshotCount })}</span></article><article className="glass-panel security-card"><HardDrive size={22} /><strong>{t("{count} KB local data", { count: Math.max(1, Math.round(security.databaseSizeBytes / 1024)) })}</strong><span>{t("Stored only in the current Windows profile.")}</span></article></div>
    <div className="glass-panel security-details"><div><FileKey2 size={19} /><span><strong>{t("Database location")}</strong><small>{localizeValue(security.databasePath, language)}</small></span></div><div><ShieldCheck size={19} /><span><strong>{t("Authentication boundary")}</strong><small>{t("Codex, Claude Code and Antigravity keep their own credentials. AI Usage Hub stores only account labels and usage snapshots.")}</small></span></div><div><Trash2 size={19} /><span><strong>{t("Usage history")}</strong><small>{t("Remove snapshots and generated usage alerts while keeping account names.")}</small></span><button className="danger-button" onClick={() => void clear()}><Trash2 size={14} />{t("Clear usage history")}</button></div></div>
  </section>;
}
