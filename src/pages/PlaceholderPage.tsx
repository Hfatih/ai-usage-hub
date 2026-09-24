import { Construction, ShieldCheck } from "lucide-react";
import { useTranslation } from "../i18n";

export function PlaceholderPage({ title, eyebrow, message }: { title: string; eyebrow: string; message: string }) {
  const { t } = useTranslation();
  return <section><div className="page-heading"><div><span className="eyebrow">{t(eyebrow)}</span><h1>{t(title)}</h1></div></div><div className="placeholder glass-panel"><span><Construction size={26} /></span><h2>{t("Designed, not pretended")}</h2><p>{t(message)}</p><div><ShieldCheck size={15} />{t("The current MVP keeps unsupported capabilities explicit.")}</div></div></section>;
}
