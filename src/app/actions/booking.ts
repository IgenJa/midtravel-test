"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  parseCompanion,
} from "@/lib/form-validation";
import {
  BOOKING_CURRENCY,
  calcDepositAmount,
  getAppUrl,
  getDepositPercent,
  isStripeConfigured,
  requireStripe,
  toStripeUnitAmount,
} from "@/lib/stripe";
import type { Locale } from "@/i18n/routing";
import { parseLocale } from "@/lib/locale";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { isTripCapacityFullError } from "@/lib/trip-capacity";
import { assertTripHasCapacity } from "@/lib/trip-capacity-db";

export type BookingCheckoutInput = {
  fullName: string;
  email: string;
  phone: string;
  participants: number;
  tripSlug: string;
  message: string;
  requestInsurance: boolean;
  hasCompanion?: boolean;
  companionName?: string;
  companionPhone?: string;
  acceptPrivacy: boolean;
  locale?: Locale;
};

export type BookingCheckoutResult =
  | { ok: true; url: string; bookingId: string }
  | {
      ok: false;
      code:
        | "VALIDATION"
        | "PRIVACY_REQUIRED"
        | "RATE_LIMITED"
        | "AUTH_REQUIRED"
        | "TRIP_NOT_FOUND"
        | "TRIP_FULL"
        | "STRIPE_NOT_CONFIGURED"
        | "CHECKOUT_FAILED";
      fieldErrors?: Partial<
        Record<
          | "fullName"
          | "email"
          | "phone"
          | "participants"
          | "tripSlug"
          | "message"
          | "companionName"
          | "companionPhone",
          string
        >
      >;
    };

export async function createBookingCheckout(
  input: BookingCheckoutInput
): Promise<BookingCheckoutResult> {
  const limited = await rateLimit("booking", RATE_LIMITS.booking);
  if (!limited.ok) {
    return { ok: false, code: "RATE_LIMITED" };
  }

  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);
  const phone = input.phone.trim();
  const tripSlug = input.tripSlug.trim();
  const message = input.message.trim() || null;
  const participants = Number(input.participants);
  const locale = parseLocale(input.locale);

  const fieldErrors: NonNullable<
    Extract<BookingCheckoutResult, { ok: false }>["fieldErrors"]
  > = {};

  if (!fullName || fullName.length < 2) fieldErrors.fullName = "fullName";
  if (!email || !isValidEmail(email)) fieldErrors.email = "email";
  if (!phone || !isValidPhone(phone)) fieldErrors.phone = "phone";
  if (!Number.isFinite(participants) || participants < 1) {
    fieldErrors.participants = "participants";
  } else if (participants > 20) {
    fieldErrors.participants = "participantsMax";
  }
  if (!tripSlug) fieldErrors.tripSlug = "tripSlug";

  const companion = parseCompanion(input);
  if (!companion.ok) {
    fieldErrors[companion.field] = companion.field;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, code: "VALIDATION", fieldErrors };
  }

  const companionValue = companion.ok
    ? companion.value
    : { companionName: null, companionPhone: null };

  if (!input.acceptPrivacy) {
    return { ok: false, code: "PRIVACY_REQUIRED" };
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, code: "AUTH_REQUIRED" };
  }

  if (!isStripeConfigured()) {
    return { ok: false, code: "STRIPE_NOT_CONFIGURED" };
  }

  const trip = await prisma.trip.findFirst({
    where: { slug: tripSlug, published: true },
    select: {
      id: true,
      slug: true,
      price: true,
      translations: {
        where: { locale: { in: [locale, "en", "hu"] } },
        select: { locale: true, title: true },
      },
    },
  });

  if (!trip) {
    return {
      ok: false,
      code: "TRIP_NOT_FOUND",
      fieldErrors: { tripSlug: "tripSlug" },
    };
  }

  const tripTitle =
    trip.translations.find((item) => item.locale === locale)?.title ??
    trip.translations.find((item) => item.locale === "en")?.title ??
    trip.translations[0]?.title ??
    trip.slug;

  const totalAmount = trip.price * participants;
  const depositPercent = getDepositPercent();
  const depositAmount = calcDepositAmount(totalAmount, depositPercent);
  const currency = BOOKING_CURRENCY.toUpperCase();

  try {
    const { booking, payment } = await prisma.$transaction(async (tx) => {
      await assertTripHasCapacity(tx, trip.id);

      const application = await tx.tripApplication.create({
        data: {
          fullName,
          email,
          phone,
          participants,
          tripSlug,
          tripId: trip.id,
          message,
          requestInsurance: Boolean(input.requestInsurance),
          companionName: companionValue.companionName,
          companionPhone: companionValue.companionPhone,
          locale,
          userId: session.user.id,
        },
      });

      const booking = await tx.booking.create({
        data: {
          tripId: trip.id,
          userId: session.user.id,
          participants,
          amount: totalAmount,
          currency,
          status: "pending",
          locale,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          companionName: companionValue.companionName,
          companionPhone: companionValue.companionPhone,
          notes: [
            message ? `Üzenet: ${message}` : null,
            input.requestInsurance ? "Utasbiztosítás kérve" : null,
            companionValue.companionName
              ? `Társ (ülőhely): ${companionValue.companionName}${companionValue.companionPhone ? `, ${companionValue.companionPhone}` : ""}`
              : null,
            `Jelentkezés: ${application.id}`,
            `Előleg: ${depositPercent}%`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      });

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: depositAmount,
          currency,
          status: "pending",
        },
      });

      return { booking, payment };
    });

    const stripe = requireStripe();
    const appUrl = getAppUrl();
    const localePrefix = `/${locale}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: booking.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: BOOKING_CURRENCY,
            unit_amount: toStripeUnitAmount(depositAmount, BOOKING_CURRENCY),
            product_data: {
              name: `${tripTitle} — ${depositPercent}% előleg / deposit`,
              description: `${participants} résztvevő · teljes ár ${totalAmount} ${currency}`,
            },
          },
        },
      ],
      metadata: {
        bookingId: booking.id,
        paymentId: payment.id,
        tripId: trip.id,
        tripSlug: trip.slug,
        userId: session.user.id,
        participants: String(participants),
        depositPercent: String(depositPercent),
        locale,
      },
      success_url: `${appUrl}${localePrefix}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${localePrefix}/booking/cancel?booking_id=${booking.id}`,
    });

    if (!checkoutSession.url) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "cancelled" },
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
      return { ok: false, code: "CHECKOUT_FAILED" };
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return {
      ok: true,
      url: checkoutSession.url,
      bookingId: booking.id,
    };
  } catch (error) {
    if (isTripCapacityFullError(error)) {
      return { ok: false, code: "TRIP_FULL" };
    }
    Sentry.captureException(error);
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[booking] checkout failed:",
        error instanceof Error ? error.message : error
      );
    }
    return { ok: false, code: "CHECKOUT_FAILED" };
  }
}
