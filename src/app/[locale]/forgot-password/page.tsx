import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/ui/Hero";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ForgotPasswordForm } from "@/components/ui/ForgotPasswordForm";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    ...createMetadata({
      title: t("forgotPasswordTitle"),
      description: t("forgotPasswordDescription"),
      path: "/forgot-password",
      locale,
      siteTagline: t("siteTagline"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("forgotPassword");

  return (
    <RedirectIfAuthenticated>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1920&q=80"
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
              <ForgotPasswordForm />
            </div>
          </Card>
        </div>
      </AnimatedSection>
    </RedirectIfAuthenticated>
  );
}
