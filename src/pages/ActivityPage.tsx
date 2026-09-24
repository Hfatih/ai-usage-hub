import { Activity, Circle } from "lucide-react";
import { useEffect } from "react";
import { relativeTime } from "../lib/format";
import { localizeEvent, useTranslation } from "../i18n";
import { useHub } from "../stores/hub";

export function ActivityPage() {
  const { language, t } = useTranslation();
  const { activity, loadActivity } = useHub();
  useEffect(() => { void loadActivity(); }, [loadActivity]);
  return (
    <section>
      <div className="page-heading"><div><span className="eyebrow">{t("Local history")}</span><h1>{t("Activity")}</h1><p>{t("Recent app launches, closes and monitoring changes.")}</p></div></div>
      <div className="timeline glass-panel">
        {activity.map((event) => { const content = localizeEvent(event.title, event.detail, event.eventType, language); return <div className="timeline-event" key={event.id}><span className={`timeline-dot timeline-dot--${event.severity}`}><Circle size={8} fill="currentColor" /></span><div><strong>{content.title}</strong>{content.detail && <p>{content.detail}</p>}</div><time>{relativeTime(event.createdAt)}</time></div>; })}
        {!activity.length && <div className="empty-state"><Activity size={28} /><strong>{t("No activity yet")}</strong><span>{t("Launch a configured app and it will appear here.")}</span></div>}
      </div>
    </section>
  );
}
