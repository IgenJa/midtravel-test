import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSentryConsent,
  isSentryClientConfigured,
  SENTRY_CONSENT_STORAGE_KEY,
  setSentryConsent,
} from "@/lib/sentry-consent";
import { withEnv } from "../helpers/env";

describe("isSentryClientConfigured", () => {
  it("follows NEXT_PUBLIC_SENTRY_DSN", () => {
    withEnv({ NEXT_PUBLIC_SENTRY_DSN: undefined }, () => {
      expect(isSentryClientConfigured()).toBe(false);
    });
    withEnv({ NEXT_PUBLIC_SENTRY_DSN: "https://example@sentry.io/1" }, () => {
      expect(isSentryClientConfigured()).toBe(true);
    });
  });
});

describe("getSentryConsent", () => {
  it("is null on the server (no window)", () => {
    expect(getSentryConsent()).toBeNull();
  });
});

describe("setSentryConsent", () => {
  const store = new Map<string, string>();

  afterEach(() => {
    store.clear();
    vi.unstubAllGlobals();
  });

  it("persists accepted / rejected in localStorage", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
      },
    });

    setSentryConsent("accepted");
    expect(store.get(SENTRY_CONSENT_STORAGE_KEY)).toBe("accepted");
    expect(getSentryConsent()).toBe("accepted");

    setSentryConsent("rejected");
    expect(getSentryConsent()).toBe("rejected");
  });
});
