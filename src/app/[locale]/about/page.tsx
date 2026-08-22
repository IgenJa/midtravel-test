import type { Metadata } from "next";
import Image from "next/image";
import { Compass, Sparkles, GraduationCap, BadgeCheck, Target, Eye } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/ui/Hero";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stats } from "@/components/ui/Stats";
import { AnimatedSection, FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { getCompany } from "@/data/company";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

const iconMap = {
  compass: Compass,
  sparkles: Sparkles,
  graduation: GraduationCap,
  badge: BadgeCheck,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    path: "/about",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");
  const company = getCompany(locale);

  return (
    <>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        image="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80"
        compact
      />

      {/* Story */}
      <AnimatedSection className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn direction="left">
              <SectionHeading
                eyebrow={t("storyEyebrow")}
                title={t("storyTitle")}
                align="left"
              />
              <div className="space-y-4 text-slate-600 leading-relaxed">
                {company.about.story.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.2}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                  alt={t("storyImageAlt")}
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

      {/* Mission & Vision */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid gap-8 md:grid-cols-2">
            <StaggerItem>
              <div className="h-full rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 text-white">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
                  {t("missionTitle")}
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  {company.about.mission}
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="h-full rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-200/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 text-white">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
                  {t("visionTitle")}
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  {company.about.vision}
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Values */}
      <AnimatedSection className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("valuesEyebrow")}
            title={t("valuesTitle")}
            description={t("valuesDescription")}
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.about.values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="h-full rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/60">
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </AnimatedSection>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28">
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
                  <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/60">
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
      </section>

      {/* Stats */}
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

      {/* CTA */}
      <AnimatedSection className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-16 text-center sm:px-16">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl" />
            <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
              {t("ctaDescription")}
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href="/team" size="lg">
                {t("meetTeam")}
              </Button>
              <Button href="/trips" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                {t("exploreTrips")}
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
