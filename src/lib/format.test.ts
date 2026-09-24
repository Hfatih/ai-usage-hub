import { describe, expect, it } from "vitest";
import { formatDateTime, formatUsageValue, resetTime, usageProgress } from "./format";
import type { UsageValue } from "../types";

function usage(value: number, unit: string, maxValue: number | null = null): UsageValue {
  return {
    metric: "test",
    label: "Test",
    value,
    maxValue,
    unit,
    source: "official_api",
    confidence: "high",
    retrievedAt: 0,
    resetAt: null,
  };
}

describe("usage formatting", () => {
  it("does not present RPM, model counts, or tokens as percentages", () => {
    expect(formatUsageValue(usage(40, "RPM"))).toBe("40 RPM");
    expect(formatUsageValue(usage(7, "models"))).toBe("7 model");
    expect(formatUsageValue(usage(104_284, "tokens"))).toContain("token");
    expect(usageProgress(usage(40, "RPM"))).toBeNull();
  });

  it("shows the exact local date and time beside the reset countdown", () => {
    const resetAt = Math.floor(Date.now() / 1000) + 3_600;
    expect(resetTime(resetAt)).toContain(formatDateTime(resetAt));
  });
});
