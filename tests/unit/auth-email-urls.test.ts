import { describe, expect, it } from "vitest";
import {
  isEmailChangeCallback,
  localeFromAuthCallbackUrl,
  verificationEmailUrl,
} from "@/lib/auth-email-urls";

function verifyUrl(callbackURL: string) {
  const url = new URL("https://midtravel.hu/api/auth/verify-email");
  url.searchParams.set("token", "abc");
  url.searchParams.set("callbackURL", callbackURL);
  return url.toString();
}

describe("localeFromAuthCallbackUrl", () => {
  it("returns en for English callback paths", () => {
    expect(localeFromAuthCallbackUrl(verifyUrl("/en/verify-email"))).toBe("en");
    expect(localeFromAuthCallbackUrl(verifyUrl("/en/profile"))).toBe("en");
  });

  it("defaults to hu", () => {
    expect(localeFromAuthCallbackUrl(verifyUrl("/hu/profile"))).toBe("hu");
    expect(localeFromAuthCallbackUrl(verifyUrl("/profile"))).toBe("hu");
  });
});

describe("isEmailChangeCallback", () => {
  it("treats profile callbacks as email-change", () => {
    expect(isEmailChangeCallback(verifyUrl("/hu/profile"))).toBe(true);
    expect(isEmailChangeCallback(verifyUrl("/en/profile"))).toBe(true);
    expect(isEmailChangeCallback(verifyUrl("https://midtravel.hu/hu/profile"))).toBe(
      true
    );
  });

  it("does not treat signup verification as email-change", () => {
    expect(isEmailChangeCallback(verifyUrl("/hu/verify-email"))).toBe(false);
    expect(isEmailChangeCallback(verifyUrl("/en/verify-email"))).toBe(false);
  });
});

describe("verificationEmailUrl", () => {
  it("rewrites signup callbacks onto the locale verify-email page", () => {
    const result = verificationEmailUrl(verifyUrl("/en"));
    expect(result.locale).toBe("en");
    expect(result.emailChange).toBe(false);
    expect(new URL(result.url).searchParams.get("callbackURL")).toBe(
      "/en/verify-email"
    );
  });

  it("keeps profile callbacks so the address only changes after the link", () => {
    const result = verificationEmailUrl(verifyUrl("/hu/profile"));
    expect(result.emailChange).toBe(true);
    expect(new URL(result.url).searchParams.get("callbackURL")).toBe(
      "/hu/profile"
    );
  });
});
