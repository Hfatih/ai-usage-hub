import { describe, expect, it } from "vitest";
import en from "./en";
import tr from "./tr";
import { currentLanguage, localizeEvent, localizeValue, translate } from ".";

describe("interface languages", () => {
  it("starts in English before settings load", () => {
    expect(currentLanguage()).toBe("en");
  });

  it("has a Turkish value for every English interface key", () => {
    expect(Object.keys(tr).sort()).toEqual(Object.keys(en).sort());
  });

  it("switches values and interpolates without changing stored provider data", () => {
    expect(translate("Settings", "tr")).toBe("Ayarlar");
    expect(translate("Settings", "en")).toBe("Settings");
    expect(translate("{count} apps running", "tr", { count: 2 })).toBe("2 uygulama çalışıyor");
    expect(localizeValue("Gemini Models · Five Hour Limit Remaining", "tr")).toBe("Gemini Modelleri · Kalan 5 saatlik limit");
    expect(localizeValue("NVIDIA · test-model rate ceiling", "tr")).toBe("NVIDIA · test-model hız üst sınırı");
    expect(localizeValue("Gemini Models · Five Hour Limit Remaining", "en")).toBe("Gemini Models · Five Hour Limit Remaining");
  });

  it("localizes stored activity and usage alert text at display time", () => {
    expect(localizeEvent("Codex launched", null, "app_started", "tr").title).toBe("Codex açıldı");
    expect(localizeEvent("Codex usage alert", "Shared weekly window has 10% remaining", "usage_warning", "tr").detail)
      .toBe("Ortak haftalık pencere için kalan %10");
  });
});
