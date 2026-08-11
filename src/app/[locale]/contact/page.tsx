import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Hero } from "@/components/ui/Hero";
import { ContactForm } from "@/components/ui/ContactForm";
import { Card } from "@/components/ui/Card";
import { AnimatedSection, FadeIn } from "@/components/ui/AnimatedSection";
import { getCompany } from "@/data/company";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("contactTitle"),
    description: t("contactDescription"),
    path: "/contact",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const company = getCompany(locale);

  return (
    <>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80"
        compact
      />

      <AnimatedSection className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <h2 className="font-display text-3xl font-bold text-slate-900">
                {t("getInTouch")}
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                {t("getInTouchDescription")}
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t("address")}</p>
                    <p className="text-slate-600">{company.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t("phone")}</p>
                    <a href={`tel:${company.phone}`} className="text-teal-600 hover:underline">
                      {company.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t("email")}</p>
                    <a href={`mailto:${company.email}`} className="text-teal-600 hover:underline">
                      {company.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t("businessHours")}</p>
                    <p className="text-slate-600">{company.businessHours.weekdays}</p>
                    <p className="text-slate-600">{company.businessHours.saturday}</p>
                    <p className="text-slate-600">{company.businessHours.sunday}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card hover={false} padding="lg">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {t("sendMessage")}
                </h3>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="mb-6 font-display text-2xl font-bold text-slate-900">
              {t("findUs")}
            </h2>
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200">
              <iframe
                title={t("mapTitle")}
                src="https://maps.google.com/maps?q=Szeged,Hungary&z=13&output=embed"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
