import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  parseCompanion,
} from "@/lib/form-validation";

describe("isValidEmail", () => {
  it("accepts typical addresses and trims whitespace", () => {
    expect(isValidEmail("hello@midtravel.hu")).toBe(true);
    expect(isValidEmail("  a.b+tag@example.co.uk  ")).toBe(true);
  });

  it("rejects missing parts and spaces inside the address", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a @b.com")).toBe(false);
    expect(isValidEmail("@midtravel.hu")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts international and local formats with separators", () => {
    expect(isValidPhone("+36301112233")).toBe(true);
    expect(isValidPhone("+36 20 431 2094")).toBe(true);
    expect(isValidPhone("(06) 20-431-2094")).toBe(true);
  });

  it("rejects too-short or letter-containing values", () => {
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("call-me")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});

describe("parseCompanion", () => {
  it("stores nothing when the companion checkbox is off", () => {
    expect(
      parseCompanion({
        hasCompanion: false,
        companionName: "Anna",
        companionPhone: "+36301112233",
      })
    ).toEqual({
      ok: true,
      value: { companionName: null, companionPhone: null },
    });
  });

  it("requires a name and a valid phone when the checkbox is on", () => {
    expect(
      parseCompanion({
        hasCompanion: true,
        companionName: "  ",
        companionPhone: "+36301112233",
      })
    ).toEqual({ ok: false, field: "companionName" });

    expect(
      parseCompanion({
        hasCompanion: true,
        companionName: "Béla",
        companionPhone: "abc",
      })
    ).toEqual({ ok: false, field: "companionPhone" });

    expect(
      parseCompanion({
        hasCompanion: true,
        companionName: "  Béla Kovács  ",
        companionPhone: "+36 20 431 2094",
      })
    ).toEqual({
      ok: true,
      value: { companionName: "Béla Kovács", companionPhone: "+36 20 431 2094" },
    });
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Admin@MidTravel.HU ")).toBe("admin@midtravel.hu");
  });
});
