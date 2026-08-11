import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/ui/Hero";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProfileForm } from "@/components/ui/ProfileForm";
import { ProfileBookings } from "@/components/ui/ProfileBookings";
import { createMetadata } from "@/lib/seo";
import { getSession } from "@/lib/session";
import { getBookingsForUser } from "@/lib/bookings";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("profileTitle"),
    description: t("profileDescription"),
    path: "/profile",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("profile");
  const session = await getSession();
  const bookings = session?.user?.id
    ? await getBookingsForUser(session.user.id, locale)
    : [];

  return (
    <AuthGuard>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1920&q=80"
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
              <ProfileForm />
            </div>
          </Card>

          <ProfileBookings bookings={bookings} locale={locale} />
        </div>
      </AnimatedSection>
    </AuthGuard>
  );
}
