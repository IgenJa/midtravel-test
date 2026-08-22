import * as Sentry from "@sentry/nextjs";

export const SENTRY_CONSENT_STORAGE_KEY = "midtravel.sentry-consent";
export const SENTRY_CONSENT_EVENT = "midtravel:cookie-settings";

export type SentryConsent = "accepted" | "rejected";

export function isSentryClientConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function getSentryConsent(): SentryConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(SENTRY_CONSENT_STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function setSentryConsent(value: SentryConsent): void {
  try {
    window.localStorage.setItem(SENTRY_CONSENT_STORAGE_KEY, value);
  } catch {
    // Private mode can block storage; still apply the in-memory choice.
  }
  applySentryClientConsent(value);
}

export function applySentryClientConsent(
  value: SentryConsent | null = getSentryConsent(),
): void {
  const client = Sentry.getClient();
  if (!client) return;
  client.getOptions().enabled = value === "accepted" && isSentryClientConfigured();
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(SENTRY_CONSENT_EVENT));
}
