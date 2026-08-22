import { describe, expect, it } from "vitest";
import {
  getClientIpFromHeaders,
  RATE_LIMITS,
  rateLimitKey,
} from "@/lib/rate-limit";

describe("getClientIpFromHeaders", () => {
  it("prefers the first x-forwarded-for hop", () => {
    const headers = new Headers({
      "x-forwarded-for": " 203.0.113.10 , 10.0.0.1",
      "x-real-ip": "10.0.0.2",
    });
    expect(getClientIpFromHeaders(headers)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip, then unknown", () => {
    expect(
      getClientIpFromHeaders(new Headers({ "x-real-ip": "198.51.100.4" }))
    ).toBe("198.51.100.4");
    expect(
      getClientIpFromHeaders(
        new Headers({ "cf-connecting-ip": "198.51.100.8" })
      )
    ).toBe("198.51.100.8");
    expect(getClientIpFromHeaders(new Headers())).toBe("unknown");
  });
});

describe("RATE_LIMITS", () => {
  it("keeps form submits tighter than auth", () => {
    expect(RATE_LIMITS.contact).toEqual({ limit: 5, windowMs: 60_000 });
    expect(RATE_LIMITS.apply.limit).toBe(5);
    expect(RATE_LIMITS.booking.limit).toBe(5);
    expect(RATE_LIMITS.auth.limit).toBe(30);
  });
});

describe("rateLimitKey", () => {
  it("allows up to the limit, then blocks with retryAfterSec", () => {
    const key = `contact:test-${crypto.randomUUID()}`;
    const options = { limit: 2, windowMs: 60_000 };

    expect(rateLimitKey(key, options)).toEqual({ ok: true, remaining: 1 });
    expect(rateLimitKey(key, options)).toEqual({ ok: true, remaining: 0 });

    const blocked = rateLimitKey(key, options);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    }
  });
});
