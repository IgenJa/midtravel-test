"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="hu">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-900">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
          Error
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold">Valami hiba történt</h1>
        <p className="mt-4 max-w-md text-slate-600">
          Váratlan hiba történt. Próbáld újra, vagy térj vissza a főoldalra.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 font-semibold text-white"
          >
            Újrapróbálás
          </button>
          <a
            href="/hu"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-800"
          >
            Főoldal
          </a>
        </div>
      </body>
    </html>
  );
}
