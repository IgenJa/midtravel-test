import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/ui/Hero";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { TripsPageContent } from "./TripsPageContent";
import { getTrips } from "@/data/trips";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("tripsTitle"),
    description: t("tripsDescription"),
    path: "/trips",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function TripsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("trips");
  const trips = await getTrips(locale);

  return (
    <>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80"
        compact
      />

      <AnimatedSection className="py-20 sm:py-28">
        <TripsPageContent trips={trips} />
      </AnimatedSection>
    </>
  );
}
