export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string, locale = "en-US"): string {
  const localeMap = { hu: "hu-HU", en: "en-US" };
  const resolvedLocale = localeMap[locale as keyof typeof localeMap] ?? locale;

  return new Intl.DateTimeFormat(resolvedLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string, locale = "en-US"): string {
  const localeMap = { hu: "hu-HU", en: "en-US" };
  const resolvedLocale = localeMap[locale as keyof typeof localeMap] ?? locale;

  return new Intl.DateTimeFormat(resolvedLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
