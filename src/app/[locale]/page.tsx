import { Compass, Sparkles, GraduationCap, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeHero } from "./HomeHero";
import { Button } from "@/components/ui/Button";
import { TripCard } from "@/components/ui/TripCard";
import { Testimonials } from "@/components/ui/Testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stats } from "@/components/ui/Stats";
import { AnimatedSection, FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { getCompany } from "@/data/company";
import { getTrips, getFeaturedTrips } from "@/data/trips";
import { getTestimonials } from "@/data/testimonials";
import type { Locale } from "@/i18n/routing";

const iconMap = {
  compass: Compass,
  sparkles: Sparkles,
  graduation: GraduationCap,
  badge: BadgeCheck,
};

type Props = { params: Promise<{ locale: Locale }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const company = getCompany(locale);
  const featuredTrips = await getFeaturedTrips(locale);
  const trips = await getTrips(locale);
  const testimonials = await getTestimonials(locale);

  return (
    <>
      <HomeHero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
        exploreLabel={t("exploreTrips")}
        signUpLabel={t("signUp")}
      />

      <AnimatedSection className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn direction="left">
              <SectionHeading
                eyebrow={t("aboutEyebrow")}
                title={t("aboutTitle")}
                description={company.description}
                align="left"
              />
              <Button href="/about" variant="outline" className="mt-6">
                {t("learnMore")}
              </Button>
            </FadeIn>
            <FadeIn direction="right" delay={0.2}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80"
                  alt={t("aboutImageAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/20 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </div>
      </AnimatedSection>

      <section className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeading
              eyebrow={t("featuredEyebrow")}
              title={t("featuredTitle")}
              description={t("featuredDescription")}
            />
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredTrips.map((trip) => (
              <StaggerItem key={trip.id}>
                <TripCard trip={trip} featured compact />
              </StaggerItem>
            ))}
          </StaggerContainer>
          <div className="mt-12 text-center">
            <Button href="/trips" variant="outline">
              {t("viewAllTrips")}
            </Button>
          </div>
        </div>
      </section>

      <AnimatedSection className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("whyEyebrow")}
            title={t("whyTitle")}
            description={t("whyDescription")}
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.whyChooseUs.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              return (
                <StaggerItem key={item.title} className="h-full">
                  <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/60 transition-shadow hover:shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </AnimatedSection>

      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-teal-500 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="mb-12 text-center font-display text-3xl font-bold text-white sm:text-4xl">
              {t("statsTitle")}
            </h2>
            <Stats stats={company.stats} />
          </AnimatedSection>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <AnimatedSection className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("testimonialsEyebrow")}
              title={t("testimonialsTitle")}
              description={t("testimonialsDescription")}
            />
            <Testimonials testimonials={testimonials} />
          </div>
        </AnimatedSection>
      ) : null}

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-16 text-center sm:px-16">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl" />
              <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
                {t("ctaTitle")}
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
                {t("ctaDescription")}
              </p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button href="/apply" size="lg">
                  {t("applyNow")}
                </Button>
                <Button href="/contact" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  {t("contactUs")}
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeading
              eyebrow={t("latestEyebrow")}
              title={t("latestTitle")}
              description={t("latestDescription")}
            />
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {trips.slice(0, 6).map((trip) => (
              <StaggerItem key={trip.id}>
                <TripCard trip={trip} compact />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

    </>
  );
}
