import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/ui/Hero";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ResetPasswordForm } from "@/components/ui/ResetPasswordForm";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string; error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    ...createMetadata({
      title: t("resetPasswordTitle"),
      description: t("resetPasswordDescription"),
      path: "/reset-password",
      locale,
      siteTagline: t("siteTagline"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, error } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("resetPassword");
  const tokenInvalid = error === "INVALID_TOKEN" || !token;

  return (
    <>
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
              {tokenInvalid ? t("invalidTitle") : t("formTitle")}
            </h2>
            <p className="mt-2 text-slate-600">
              {tokenInvalid ? t("invalidLink") : t("formDescription")}
            </p>
            <div className="mt-8">
              <ResetPasswordForm token={token} tokenInvalid={tokenInvalid} />
            </div>
          </Card>
        </div>
      </AnimatedSection>
    </>
  );
}
