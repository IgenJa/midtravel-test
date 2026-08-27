import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { CookieSettingsButton } from "@/components/legal/CookieConsentBanner";
import { getResolvedCompany } from "@/lib/content/company";
import type { Locale } from "@/i18n/routing";

export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const company = await getResolvedCompany(locale);

  const footerLinks = {
    explore: [
      { href: "/trips" as const, label: t("allTrips") },
      { href: "/about" as const, label: tNav("about") },
      { href: "/apply" as const, label: t("applyTrip") },
      { href: "/login" as const, label: t("signIn") },
      { href: "/register" as const, label: t("signUp") },
      { href: "/team" as const, label: tNav("team") },
      { href: "/contact" as const, label: t("contact") },
    ],
    legal: [
      { href: "/impressum" as const, label: t("impressum") },
      { href: "/privacy-policy" as const, label: t("privacyPolicy") },
      { href: "/travel-contract" as const, label: t("travelContract") },
    ],
  };

  return (
    <footer className="border-t border-teal-300/30 bg-navy text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt={company.name}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-teal-300/40"
              />
              <span className="font-display text-xl font-bold text-white">
                {company.name}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              {company.tagline}. {company.footerTagline}
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={company.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-teal-200 transition-colors hover:bg-teal-700 hover:text-white"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("explore")}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-teal-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("legal")}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-teal-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {process.env.NEXT_PUBLIC_SENTRY_DSN ? (
                <li>
                  <CookieSettingsButton label={t("cookieSettings")} />
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("contact")}
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-200" />
                {company.address}
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-teal-200" />
                <a href={`tel:${company.phoneHref}`} className="hover:text-white">
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-teal-200" />
                <a href={`mailto:${company.email}`} className="hover:text-white">
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-8 text-center text-sm text-white/50">
          <p>
            &copy; {new Date().getFullYear()} {company.legalName}. {t("rights")}
          </p>
          <p className="mt-3 leading-relaxed">
            {t("registeredOffice")}: {company.address}
            {" · "}
            {t("taxId")}: {company.taxId}
            {" · "}
            {t("companyRegistryNumber")}: {company.companyRegistryNumber}
          </p>
        </div>
      </div>
    </footer>
  );
}
