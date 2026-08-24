import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Calendar,
  MapPin,
  Mountain,
  Check,
  Users,
  X,
  ArrowRight,
} from "lucide-react";
import { Hero } from "@/components/ui/Hero";
import { Gallery } from "@/components/ui/Gallery";
import { TripProgram } from "@/components/ui/TripProgram";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AnimatedSection, FadeIn } from "@/components/ui/AnimatedSection";
import { getTripBySlug, getAllTripSlugs, getTripCapacityForSlug } from "@/data/trips";
import { JsonLd } from "@/components/seo/JsonLd";
import { touristTripJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/seo";
import { formatPrice, formatDate } from "@/lib/utils";
import { getDifficultyLabel } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getAllTripSlugs();
    const locales: Locale[] = ["hu", "en"];
    return locales.flatMap((locale) =>
      slugs.map((slug) => ({ locale, slug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const trip = await getTripBySlug(slug, locale);
  if (!trip) return {};

  const tSeo = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: trip.title,
    description: trip.shortDescription,
    path: `/trips/${trip.slug}`,
    image: trip.heroImage,
    locale,
    siteTagline: tSeo("siteTagline"),
  });
}

const difficultyColors = {
  Easy: "bg-green-100 text-green-700",
  Moderate: "bg-amber-100 text-amber-700",
  Challenging: "bg-red-100 text-red-700",
};

export default async function TripDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const trip = await getTripBySlug(slug, locale);
  const t = await getTranslations("tripDetail");
  const tCommon = await getTranslations("common");

  if (!trip) notFound();
  const capacity = await getTripCapacityForSlug(trip.slug);

  return (
    <>
      <JsonLd data={touristTripJsonLd(trip, locale)} />
      <Hero
        title={trip.title}
        subtitle={trip.shortDescription}
        image={trip.heroImage}
        ctaPrimary={{
          label: capacity?.isFull ? t("tripFull") : t("applyForTrip"),
          href: `/apply?trip=${trip.slug}`,
        }}
        compact
      />

      <div className="border-b border-teal-200 bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-4 sm:gap-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-teal-600" />
            {trip.duration} {tCommon("days")}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-teal-600" />
            {trip.country}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mountain className="h-4 w-4 text-teal-600" />
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyColors[trip.difficulty]}`}>
              {getDifficultyLabel(trip.difficulty, locale)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-teal-700">
            {tCommon("from")} {formatPrice(trip.price)}
          </div>
        </div>
      </div>

      <AnimatedSection className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              {t("aboutTitle")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              {trip.description}
            </p>
          </div>
        </div>
      </AnimatedSection>

      <section className="bg-teal-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="mb-8 font-display text-3xl font-bold text-slate-900">
              {t("galleryTitle")}
            </h2>
            <Gallery images={trip.gallery} title={trip.title} />
          </FadeIn>
        </div>
      </section>

      <AnimatedSection className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 font-display text-3xl font-bold text-slate-900">
            {t("programTitle")}
          </h2>
          <TripProgram
            program={trip.program}
            dayLabel={(day) => t("dayLabel", { day })}
          />
        </div>
      </AnimatedSection>

      <section className="bg-teal-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <FadeIn direction="left">
              <Card hover={false}>
                <h3 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <Check className="h-5 w-5 text-teal-600" />
                  {t("includedTitle")}
                </h3>
                <ul className="mt-4 space-y-3">
                  {trip.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeIn>
            <FadeIn direction="right">
              <Card hover={false}>
                <h3 className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
                  <X className="h-5 w-5 text-red-500" />
                  {t("notIncludedTitle")}
                </h3>
                <ul className="mt-4 space-y-3">
                  {trip.notIncluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-slate-600">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      <AnimatedSection className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-8 font-display text-3xl font-bold text-slate-900">
                {t("faqTitle")}
              </h2>
              <FaqAccordion items={trip.faq} />
            </div>
            <div>
              <Card hover={false} className="sticky top-24">
                <p className="text-sm text-slate-500">{t("pricePerPerson")}</p>
                <p className="font-display text-3xl font-bold text-teal-700">
                  {formatPrice(trip.price)}
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t("departureDates")}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {trip.departureDates.map((date) => (
                        <li
                          key={date}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <Calendar className="h-3.5 w-3.5 text-teal-500" />
                          {formatDate(date, locale)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t("meetingPoint")}
                    </p>
                    <p className="mt-1 flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" />
                      {trip.meetingPoint}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t("difficulty")}
                    </p>
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${difficultyColors[trip.difficulty]}`}>
                      {getDifficultyLabel(trip.difficulty, locale)}
                    </span>
                  </div>
                  {capacity ? (
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {t("capacity")}
                      </p>
                      <p
                        className={`mt-1 flex items-center gap-2 text-sm ${
                          capacity.isFull ? "text-red-600" : "text-slate-600"
                        }`}
                      >
                        <Users className="h-3.5 w-3.5 text-teal-500" />
                        {capacity.isFull
                          ? t("tripFull")
                          : t("spotsLeft", { count: capacity.remainingSeats })}
                      </p>
                    </div>
                  ) : null}
                </div>

                <Button
                  href={capacity?.isFull ? undefined : `/apply?trip=${trip.slug}`}
                  size="lg"
                  className="mt-8 w-full"
                  disabled={capacity?.isFull}
                >
                  {capacity?.isFull ? t("tripFull") : t("applyNow")}
                  {capacity?.isFull ? null : <ArrowRight className="h-4 w-4" />}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
