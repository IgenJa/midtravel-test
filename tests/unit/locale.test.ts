import { describe, expect, it } from "vitest";
import {
  getDifficultyLabel,
  parseLocale,
  pickLocalizedTitle,
} from "@/lib/locale";

describe("parseLocale", () => {
  it("returns en only for the en value", () => {
    expect(parseLocale("en")).toBe("en");
  });

  it("falls back to hu for missing or unknown values", () => {
    expect(parseLocale(undefined)).toBe("hu");
    expect(parseLocale(null)).toBe("hu");
    expect(parseLocale("de")).toBe("hu");
    expect(parseLocale("")).toBe("hu");
  });
});

describe("pickLocalizedTitle", () => {
  const translations = [
    { locale: "hu", title: "Alpok" },
    { locale: "en", title: "Alps" },
  ];

  it("prefers the requested locale", () => {
    expect(pickLocalizedTitle(translations, "en", "fallback")).toBe("Alps");
    expect(pickLocalizedTitle(translations, "hu", "fallback")).toBe("Alpok");
  });

  it("falls back en → hu → first → default", () => {
    expect(
      pickLocalizedTitle([{ locale: "en", title: "Alps" }], "hu", "fallback")
    ).toBe("Alps");
    expect(
      pickLocalizedTitle([{ locale: "hu", title: "Alpok" }], "en", "fallback")
    ).toBe("Alpok");
    expect(
      pickLocalizedTitle([{ locale: "de", title: "Alpen" }], "en", "fallback")
    ).toBe("Alpen");
    expect(pickLocalizedTitle([], "hu", "fallback")).toBe("fallback");
  });
});

describe("getDifficultyLabel", () => {
  it("translates difficulty for hu and keeps English labels", () => {
    expect(getDifficultyLabel("Easy", "hu")).toBe("Könnyű");
    expect(getDifficultyLabel("Moderate", "en")).toBe("Moderate");
    expect(getDifficultyLabel("Challenging", "hu")).toBe("Nehéz");
  });
});
