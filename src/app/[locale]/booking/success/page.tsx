import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle } from "lucide-react";
import { Hero } from "@/components/ui/Hero";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { fulfillPaidStripeSession } from "@/lib/bookings";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ session_id?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("bookingSuccessTitle"),
    description: t("bookingSuccessDescription"),
    path: "/booking/success",
    locale,
    siteTagline: t("siteTagline"),
  });
}

async function resolveBookingIdFromSession(sessionId: string) {
  const stripe = getStripe();
  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" || session.status === "complete") {
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        const result = await fulfillPaidStripeSession({
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
        });
        if (result) return result.bookingId;
        return session.metadata?.bookingId ?? null;
      }
    } catch {
      // Fall through to DB lookup
    }
  }

  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
    select: { bookingId: true },
  });
  return payment?.bookingId ?? null;
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { session_id: sessionId } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("booking");

  const bookingId = sessionId
    ? await resolveBookingIdFromSession(sessionId)
    : null;

  return (
    <>
      <Hero
        title={t("successHeroTitle")}
        subtitle={t("successHeroSubtitle")}
        image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
        compact
      />

      <AnimatedSection className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <Card hover={false} padding="lg" className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-teal-600" />
            <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">
              {t("successTitle")}
            </h2>
            <p className="mt-2 text-slate-600">{t("successDescription")}</p>
            {bookingId && (
              <p className="mt-4 text-sm text-slate-500">
                {t("bookingIdLabel")}:{" "}
                <span className="font-mono text-slate-700">{bookingId}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href="/profile" size="lg">
                {t("viewBookings")}
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
