import * as Sentry from "@sentry/nextjs";
import { getSentryConsent } from "./lib/sentry-consent";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn) && getSentryConsent() === "accepted",
  sendDefaultPii: false,
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend(event) {
    if (getSentryConsent() !== "accepted") return null;
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
