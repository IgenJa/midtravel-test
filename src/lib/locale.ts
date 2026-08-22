import type { Locale } from "@/i18n/routing";

export function parseLocale(value?: string | null): Locale {
  return value === "en" ? "en" : "hu";
}

export function pickLocalizedTitle(
  translations: { locale: string; title: string }[],
  locale: Locale,
  fallback: string
): string {
  return (
    translations.find((item) => item.locale === locale)?.title ??
    translations.find((item) => item.locale === "en")?.title ??
    translations.find((item) => item.locale === "hu")?.title ??
    translations[0]?.title ??
    fallback
  );
}

const difficultyLabels: Record<Locale, Record<string, string>> = {
  en: { Easy: "Easy", Moderate: "Moderate", Challenging: "Challenging" },
  hu: { Easy: "Könnyű", Moderate: "Közepes", Challenging: "Nehéz" },
};

export function getDifficultyLabel(
  difficulty: "Easy" | "Moderate" | "Challenging",
  locale: Locale
): string {
  return difficultyLabels[locale][difficulty];
}
