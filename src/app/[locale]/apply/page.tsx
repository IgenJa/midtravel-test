import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/ui/Hero";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { createMetadata } from "@/lib/seo";
import { TripApplicationFormWrapper } from "./TripApplicationFormWrapper";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("applyTitle"),
    description: t("applyDescription"),
    path: "/apply",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function ApplyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("tripApplication");

  return (
    <>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        image="https://images.unsplash.com/photo-1436491865332-7a61a04cc496?w=1920&q=80"
        compact
      />

      <AnimatedSection className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card hover={false} padding="lg">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {t("formTitle")}
            </h2>
            <p className="mt-2 text-slate-600">{t("formDescription")}</p>
            <div className="mt-8">
              <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-slate-100" />}>
                <TripApplicationFormWrapper />
              </Suspense>
            </div>
          </Card>
        </div>
      </AnimatedSection>
    </>
  );
}
