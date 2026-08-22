import type { Locale } from "@/i18n/routing";

function callbackFromAuthUrl(url: string): string {
  try {
    return decodeURIComponent(new URL(url).searchParams.get("callbackURL") ?? "");
  } catch {
    return "";
  }
}

function callbackPath(callback: string): string {
  if (!callback) return "";
  try {
    return callback.startsWith("http") ? new URL(callback).pathname : callback;
  } catch {
    return callback;
  }
}

export function localeFromAuthCallbackUrl(url: string): Locale {
  const path = callbackPath(callbackFromAuthUrl(url));
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return "hu";
}

export function isEmailChangeCallback(url: string): boolean {
  return callbackPath(callbackFromAuthUrl(url)).includes("/profile");
}

export function verificationEmailUrl(url: string): {
  locale: Locale;
  url: string;
  emailChange: boolean;
} {
  const locale = localeFromAuthCallbackUrl(url);
  const emailChange = isEmailChangeCallback(url);
  try {
    const parsed = new URL(url);
    if (!emailChange) {
      parsed.searchParams.set("callbackURL", `/${locale}/verify-email`);
    }
    return { locale, url: parsed.toString(), emailChange };
  } catch {
    return { locale, url, emailChange };
  }
}
