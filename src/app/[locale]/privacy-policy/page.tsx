import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { OfficialDocuments } from "@/components/legal/OfficialDocuments";
import { createMetadata } from "@/lib/seo";
import { getPrivacySupplement } from "@/data/privacy-supplement";
import { getResolvedCompany } from "@/lib/content/company";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    path: "/privacy-policy",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("privacy");
  const company = await getResolvedCompany(locale);
  const supplement = getPrivacySupplement(locale, company);

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <article className="lg:col-span-8">
              <h1 className="font-display text-4xl font-bold text-slate-900">
                {t("title")}
              </h1>
              <p className="mt-4 text-slate-500">{supplement.lastUpdated}</p>
              <p className="mt-6 text-slate-600 leading-relaxed">
                {supplement.intro}
              </p>

              <div className="mt-12 space-y-10">
                {supplement.sections.map((section) => (
                  <section
                    key={section.title}
                    id={section.id}
                    className={section.id ? "scroll-mt-28" : undefined}
                  >
                    <h2 className="font-display text-2xl font-bold text-slate-900">
                      {section.title}
                    </h2>
                    {section.paragraphs.map((paragraph, index) => (
                      <p
                        key={`${section.title}-${index}`}
                        className="mt-4 text-slate-600 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))}
              </div>
            </article>

            <aside className="lg:sticky lg:top-24 lg:col-span-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {t("documentsHeading")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {t("documentsIntro")}
              </p>
              <ul className="mt-5 space-y-3">
                <li>
                  <a
                    href="#adatkezelesi-tajekoztato"
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:border-teal-200 hover:bg-teal-50"
                  >
                    {t("privacyPdfTitle")}
                  </a>
                </li>
                <li>
                  <a
                    href="#utazasi-szerzodes"
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:border-teal-200 hover:bg-teal-50"
                  >
                    {t("contractPdfTitle")}
                  </a>
                </li>
              </ul>
            </aside>
          </div>

          <OfficialDocuments
            documentsHeading={t("documentsHeading")}
            privacyTitle={t("privacyPdfTitle")}
            privacyCaption={t("privacyPdfCaption")}
            contractTitle={t("contractPdfTitle")}
            contractCaption={t("contractPdfCaption")}
            downloadLabel={t("downloadPdf")}
          />
        </AnimatedSection>
      </div>
    </div>
  );
}
