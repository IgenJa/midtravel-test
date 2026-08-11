"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
        Error
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold text-slate-900 sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-slate-600">{t("description")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button type="button" onClick={reset}>
          {t("retry")}
        </Button>
        <Button href="/" variant="outline">
          {t("goHome")}
        </Button>
      </div>
    </div>
  );
}
