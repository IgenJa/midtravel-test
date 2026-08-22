import { describe, expect, it } from "vitest";
import { COMPANY, getCompany, toPhoneHref } from "@/data/company";

describe("toPhoneHref", () => {
  it("keeps E.164, converts 00-prefix, and strips separators", () => {
    expect(toPhoneHref("+36 20 431 2094")).toBe("+36204312094");
    expect(toPhoneHref("0036204312094")).toBe("+36204312094");
    expect(toPhoneHref("36204312094")).toBe("+36204312094");
  });
});

describe("getCompany", () => {
  it("uses Hungarian address order and localized copy", () => {
    const hu = getCompany("hu");
    expect(hu.address).toBe(
      `${COMPANY.postalCode} ${COMPANY.city}, ${COMPANY.streetAddress}`
    );
    expect(hu.tagline).toContain("világot");
    expect(hu.email).toBe(COMPANY.email);
    expect(hu.phoneHref).toBe("+36204312094");
  });

  it("uses English address order and applies admin overrides", () => {
    const en = getCompany("en", {
      email: "office@example.com",
      phone: "+36 30 111 2233",
      streetAddress: "Main 1",
      postalCode: "1000",
      city: "Budapest",
      facebook: "https://facebook.com/midtravel",
    });

    expect(en.address).toBe("Main 1, 1000 Budapest, Hungary");
    expect(en.email).toBe("office@example.com");
    expect(en.phoneHref).toBe("+36301112233");
    expect(en.social.facebook).toBe("https://facebook.com/midtravel");
    expect(en.tagline).toMatch(/world/i);
  });
});

