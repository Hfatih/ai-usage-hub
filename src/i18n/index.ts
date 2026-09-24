import { useHub } from "../stores/hub";
import en from "./en";
import tr from "./tr";

export type Language = "tr" | "en";
type Values = Record<string, string | number>;

export function currentLanguage(): Language {
  return useHub.getState().settings?.language === "en" ? "en" : "tr";
}

export function translate(key: string, language: Language = currentLanguage(), values: Values = {}): string {
  const dictionary = language === "en" ? en : tr;
  const template = dictionary[key] ?? en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}

export function useTranslation() {
  const language = useHub<Language>((state) => state.settings?.language === "en" ? "en" : "tr");
  return { language, t: (key: string, values?: Values) => translate(key, language, values) };
}

export function localizeValue(value: string, language: Language = currentLanguage()): string {
  if (language === "en") return value;
  if (tr[value]) return tr[value];
  let match = value.match(/^(\d+)-(day|hour|minute) window$/);
  if (match) return `${match[1]} ${match[2] === "day" ? "günlük" : match[2] === "hour" ? "saatlik" : "dakikalık"} pencere`;
  match = value.match(/^NVIDIA · (.+) rate ceiling$/);
  if (match) return `NVIDIA · ${match[1]} hız üst sınırı`;
  const errorPrefixes: Record<string, string> = {
    "Codex usage is unavailable: ": "Codex kullanımı alınamadı: ",
    "Claude Code auth status is unavailable: ": "Claude Code oturum durumu alınamadı: ",
    "Antigravity usage is unavailable: ": "Antigravity kullanımı alınamadı: ",
    "invalid Codex account response: ": "Geçersiz Codex hesap yanıtı: ",
    "invalid Codex usage response: ": "Geçersiz Codex kullanım yanıtı: ",
  };
  for (const [prefix, translated] of Object.entries(errorPrefixes)) {
    if (value.startsWith(prefix)) return translated + localizeValue(value.slice(prefix.length), language);
  }
  const parts = value.split(" · ");
  if (parts.length > 1) return parts.map((part) => localizeValue(part, language)).join(" · ");
  match = value.match(/^Latest: (.+)$/);
  if (match) return `Son kullanılan: ${match[1]}`;
  match = value.match(/^Latest refresh failed: (.+)$/);
  if (match) return `Son yenileme başarısız: ${localizeValue(match[1], language)}`;
  return value;
}

export function localizeEvent(title: string, detail: string | null, type: string, language: Language): { title: string; detail: string | null } {
  if (language === "en") return { title, detail };
  let resultTitle = title;
  let resultDetail = detail;
  if (type === "app_started") resultTitle = title.replace(/ launched$/, " açıldı");
  else if (type === "app_stopped") {
    resultTitle = title.replace(/ closed$/, " kapatıldı");
    resultDetail = detail?.replace(/^Application-open time: (\d+) minutes$/, "Uygulamanın açık kalma süresi: $1 dakika") ?? null;
  } else if (type === "provider_error") resultTitle = title.replace(/ refresh failed$/, " yenilenemedi");
  else if (type.startsWith("usage_")) {
    resultTitle = title.replace(/ usage alert$/, " kullanım uyarısı");
    resultDetail = detail?.replace(/^(.+) reset to (\d+)% remaining$/, (_, label: string, amount: string) => `${localizeValue(label, language)} sıfırlandı; kalan %${amount}`)
      .replace(/^(.+) has (\d+)% remaining$/, (_, label: string, amount: string) => `${localizeValue(label, language)} için kalan %${amount}`) ?? null;
  }
  return { title: resultTitle, detail: resultDetail && localizeValue(resultDetail, language) };
}
