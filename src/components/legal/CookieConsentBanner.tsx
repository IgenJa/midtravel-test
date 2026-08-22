"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import {
  getSentryConsent,
  openCookieSettings,
  setSentryConsent,
  SENTRY_CONSENT_EVENT,
  type SentryConsent,
} from "@/lib/sentry-consent";

type BannerMode = "hidden" | "prompt" | "settings";

export function CookieConsentBanner({ enabled }: { enabled: boolean }) {
  const t = useTranslations("consent");
  const locale = useLocale();
  const [mode, setMode] = useState<BannerMode>("hidden");
  const [current, setCurrent] = useState<SentryConsent | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const consent = getSentryConsent();
    setCurrent(consent);
    if (consent === null) setMode("prompt");

    const onOpenSettings = () => {
      setCurrent(getSentryConsent());
      setMode("settings");
    };

    window.addEventListener(SENTRY_CONSENT_EVENT, onOpenSettings);
    return () => window.removeEventListener(SENTRY_CONSENT_EVENT, onOpenSettings);
  }, [enabled]);

  if (!enabled || mode === "hidden") return null;

  const choose = (value: SentryConsent) => {
    setSentryConsent(value);
    setCurrent(value);
    setMode("hidden");
  };

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2
            id="cookie-consent-title"
            className="font-display text-lg font-bold text-slate-900"
          >
            {mode === "settings" ? t("settingsTitle") : t("title")}
          </h2>
          <p
            id="cookie-consent-description"
            className="mt-2 text-sm leading-relaxed text-slate-600"
          >
            {t("description")}
          </p>
          {mode === "settings" && current ? (
            <p className="mt-2 text-sm text-slate-500">
              {t("currentChoice", {
                choice: current === "accepted" ? t("accepted") : t("rejected"),
              })}
            </p>
          ) : null}
          <p className="mt-2 text-sm">
            <Link
              href={locale === "en" ? "/privacy-policy#cookies" : "/privacy-policy#sutik"}
              className="font-semibold text-teal-700 underline-offset-2 hover:underline"
            >
              {t("privacyLink")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => choose("rejected")}>
            {t("reject")}
          </Button>
          <Button type="button" size="sm" onClick={() => choose("accepted")}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="text-sm transition-colors hover:text-teal-400"
    >
      {label}
    </button>
  );
}
