import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/ui/Hero";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { AccountRegistrationForm } from "@/components/ui/AccountRegistrationForm";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("registerTitle"),
    description: t("registerDescription"),
    path: "/register",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("accountRegister");

  return (
    <RedirectIfAuthenticated>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
        compact
      />

      <AnimatedSection className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <Card hover={false} padding="lg">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {t("formTitle")}
            </h2>
            <p className="mt-2 text-slate-600">{t("formDescription")}</p>
            <div className="mt-8">
              <AccountRegistrationForm />
            </div>
          </Card>
        </div>
      </AnimatedSection>
    </RedirectIfAuthenticated>
  );
}
