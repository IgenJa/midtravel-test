import type { Locale } from "@/i18n/routing";

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
