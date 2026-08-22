import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { createMetadata } from "@/lib/seo";
import { getResolvedCompany } from "@/lib/content/company";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("impressumTitle"),
    description: t("impressumDescription"),
    path: "/impressum",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("impressum");
  const company = await getResolvedCompany(locale);

  const rows = [
    { label: t("legalName"), value: company.legalName },
    { label: t("shortName"), value: company.legalNameShort },
    { label: t("registeredOffice"), value: company.address },
    { label: t("companyRegistryNumber"), value: company.companyRegistryNumber },
    { label: t("registryCourt"), value: company.registryCourt },
    { label: t("taxId"), value: company.taxId },
    {
      label: t("phone"),
      value: (
        <a href={`tel:${company.phoneHref}`} className="text-teal-600 hover:underline">
          {company.phone}
        </a>
      ),
    },
    {
      label: t("email"),
      value: (
        <a href={`mailto:${company.email}`} className="text-teal-600 hover:underline">
          {company.email}
        </a>
      ),
    },
    {
      label: t("facebook"),
      value: (
        <a
          href={company.social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:underline"
        >
          {t("facebookLink")}
        </a>
      ),
    },
  ];

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h1 className="font-display text-4xl font-bold text-slate-900">
            {t("title")}
          </h1>
          <p className="mt-4 text-slate-500">{t("lastUpdated")}</p>
          <p className="mt-8 text-slate-600 leading-relaxed">{t("intro")}</p>

          <dl className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:items-baseline sm:gap-6"
              >
                <dt className="text-sm font-semibold text-slate-900">{row.label}</dt>
                <dd className="text-sm leading-relaxed text-slate-600">{row.value}</dd>
              </div>
            ))}
          </dl>
        </AnimatedSection>
      </div>
    </div>
  );
}
