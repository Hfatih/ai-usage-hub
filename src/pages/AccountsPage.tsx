import { Clock3, RefreshCw, ShieldCheck, Trash2, UserRoundCheck } from "lucide-react";
import { formatUsageValue, relativeTime, sourceLabel, usageProgress, usageTiming } from "../lib/format";
import { localizeValue, useTranslation } from "../i18n";
import { useHub } from "../stores/hub";

export function AccountsPage() {
  const { language, t } = useTranslation();
  const { accounts, deleteAccount, refresh, refreshing } = useHub();

  async function remove(id: string, email: string) {
    if (!window.confirm(t("Delete {email} and its local usage history from AI Usage Hub? The provider account itself will not be deleted.", { email }))) return;
    await deleteAccount(id);
  }

  return (
    <section>
      <div className="page-heading">
        <div><span className="eyebrow">{t("Saved accounts")}</span><h1>{t("Accounts")}</h1><p>{t("Active and previously seen accounts retain their full email and latest verified usage values.")}</p></div>
        <button className="primary-button" onClick={() => void refresh()} disabled={refreshing}><RefreshCw className={refreshing ? "spin" : ""} size={16} />{t("Refresh active accounts")}</button>
      </div>
      {accounts.length === 0 ? <div className="glass-panel empty-state"><UserRoundCheck size={28} /><strong>{t("No saved accounts yet")}</strong><span>{t("Sign in to Codex, Claude Code or Antigravity, then select Refresh all.")}</span></div> :
        <div className="account-grid">{accounts.map((account) => (
          <article className="glass-panel account-card" key={account.id}>
            <header><span className={`provider-logo provider-logo--${account.providerId}`}>{account.providerName.slice(0, 1)}</span><div><small>{account.providerName}</small><strong>{account.email}</strong><span>{account.plan ? localizeValue(account.plan, language) : t("Plan not reported")}</span></div><span className={`connection-pill connection-pill--${account.connectionStatus}`}>{t(account.connectionStatus === "connected" ? "Active" : "Saved")}</span></header>
            <div className="account-usage-list">
              {account.usage.length ? account.usage.map((usage) => {
                const percent = usageProgress(usage);
                return <div className="account-usage" key={usage.metric}><div><span>{localizeValue(usage.label, language)}</span><strong>{formatUsageValue(usage)}</strong></div>{percent != null && <div className="usage-track"><span style={{ width: `${percent}%` }} /></div>}<small><ShieldCheck size={11} />{sourceLabel(usage.source)} · {usageTiming(usage)}</small></div>;
              }) : <div className="account-empty-usage">{t("No programmatic quota source available for this account.")}</div>}
            </div>
            <footer><span><Clock3 size={12} />{t(account.connectionStatus === "connected" ? "Active now" : "Last known snapshot")} · {relativeTime(account.lastRefresh)}</span><button className="danger-button" onClick={() => void remove(account.id, account.email)}><Trash2 size={14} />{t("Delete")}</button></footer>
          </article>
        ))}</div>}
      <p className="page-note">{t("Signed-out accounts cannot be refreshed live without retaining their credentials. Their last verified values and timestamps remain visible.")}</p>
    </section>
  );
}
