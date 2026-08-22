import { describe, expect, it } from "vitest";
import { cn, formatDate, formatPrice } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats whole euros", () => {
    expect(formatPrice(1290)).toBe("€1,290");
  });
});

describe("formatDate", () => {
  it("uses Hungarian month names for hu and English for en", () => {
    expect(formatDate("2026-06-15T12:00:00.000Z", "hu")).toMatch(/június/i);
    expect(formatDate("2026-06-15T12:00:00.000Z", "en")).toMatch(/June/);
  });
});

describe("cn", () => {
  it("joins truthy class names and drops falsy values", () => {
    expect(cn("btn", false, undefined, "active", null, "")).toBe("btn active");
  });
});
