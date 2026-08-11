import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { XCircle } from "lucide-react";
import { Hero } from "@/components/ui/Hero";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ booking_id?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("bookingCancelTitle"),
    description: t("bookingCancelDescription"),
    path: "/booking/cancel",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function BookingCancelPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { booking_id: bookingId } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("booking");

  return (
    <>
      <Hero
        title={t("cancelHeroTitle")}
        subtitle={t("cancelHeroSubtitle")}
        image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
        compact
      />

      <AnimatedSection className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <Card hover={false} padding="lg" className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">
              {t("cancelTitle")}
            </h2>
            <p className="mt-2 text-slate-600">{t("cancelDescription")}</p>
            {bookingId && (
              <p className="mt-4 text-sm text-slate-500">
                {t("bookingIdLabel")}:{" "}
                <span className="font-mono text-slate-700">{bookingId}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href="/apply" size="lg">
                {t("tryAgain")}
              </Button>
              <Button href="/trips" variant="outline" size="lg">
                {t("browseTrips")}
              </Button>
            </div>
          </Card>
        </div>
      </AnimatedSection>
    </>
  );
}
