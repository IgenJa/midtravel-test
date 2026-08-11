"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  hu: "HU",
  en: "EN",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
            locale === loc
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-600 hover:text-teal-600"
          )}
          aria-pressed={locale === loc}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
