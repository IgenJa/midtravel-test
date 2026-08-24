import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/routing";
import type { BookingStatus, PaymentStatus } from "@/generated/prisma";
import {
  bookingConfirmationHtml,
  bookingConfirmationSubject,
  bookingNotificationHtml,
  getNotifyEmail,
  sendGuestAndOfficeEmails,
} from "@/lib/email";
import { parseLocale, pickLocalizedTitle } from "@/lib/locale";

export type UserBookingListItem = {
  id: string;
  status: BookingStatus;
  participants: number;
  amount: number;
  currency: string;
  createdAt: string;
  tripSlug: string;
  tripTitle: string;
  tripHeroImage: string;
  depositAmount: number | null;
  depositStatus: PaymentStatus | null;
};

export async function getBookingsForUser(
  userId: string,
  locale: Locale
): Promise<UserBookingListItem[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      trip: {
        include: {
          translations: {
            where: { locale: { in: [locale, "en", "hu"] } },
            select: { locale: true, title: true },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return bookings.map((booking) => {
    const title =
      booking.trip.translations.find((item) => item.locale === locale)?.title ??
      booking.trip.translations.find((item) => item.locale === "en")?.title ??
      booking.trip.translations[0]?.title ??
      booking.trip.slug;

    const latestPayment = booking.payments[0] ?? null;

    return {
      id: booking.id,
      status: booking.status,
      participants: booking.participants,
      amount: booking.amount,
      currency: booking.currency,
      createdAt: booking.createdAt.toISOString(),
      tripSlug: booking.trip.slug,
      tripTitle: title,
      tripHeroImage: booking.trip.heroImage,
      depositAmount: latestPayment?.amount ?? null,
      depositStatus: latestPayment?.status ?? null,
    };
  });
}

export async function getBookingForPaymentEmail(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      trip: {
        include: {
          translations: {
            select: { locale: true, title: true },
          },
        },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  });
}

export async function sendBookingPaidEmails(bookingId: string): Promise<boolean> {
  const booking = await getBookingForPaymentEmail(bookingId);
  if (!booking) return false;

  const locale = parseLocale(booking.locale);
  const guestTitle = pickLocalizedTitle(
    booking.trip.translations,
    locale,
    booking.trip.slug
  );
  const officeTitle = pickLocalizedTitle(
    booking.trip.translations,
    "hu",
    booking.trip.slug
  );

  const name = booking.customerName ?? booking.user.name;
  const email = booking.customerEmail ?? booking.user.email;
  const depositAmount = booking.payments[0]?.amount ?? 0;

  const status = await sendGuestAndOfficeEmails({
    guest: {
      to: email,
      subject: bookingConfirmationSubject(locale, guestTitle),
      html: bookingConfirmationHtml({
        name,
        tripTitle: guestTitle,
        participants: booking.participants,
        totalAmount: booking.amount,
        depositAmount,
        currency: booking.currency,
        bookingId: booking.id,
        locale,
      }),
    },
    office: {
      to: getNotifyEmail(),
      subject: `Új fizetett foglalás: ${officeTitle}`,
      html: bookingNotificationHtml({
        name,
        email,
        tripTitle: officeTitle,
        tripSlug: booking.trip.slug,
        participants: booking.participants,
        totalAmount: booking.amount,
        depositAmount,
        currency: booking.currency,
        bookingId: booking.id,
        companionName: booking.companionName,
        companionPhone: booking.companionPhone,
      }),
      replyTo: email,
    },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      guestEmailStatus: status.guest,
      officeEmailStatus: status.office,
    },
  });

  return status.guest === "sent" && status.office === "sent";
}

/**
 * Idempotent: marks Payment + Booking paid and sends confirmation emails once.
 */
export async function fulfillPaidStripeSession(input: {
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
}): Promise<{ bookingId: string; alreadyPaid: boolean } | null> {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: input.stripeSessionId },
  });

  if (!payment) return null;

  const transitioned = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "paid" } },
      data: {
        status: "paid",
        stripePaymentIntentId:
          input.stripePaymentIntentId ?? payment.stripePaymentIntentId,
      },
    });

    if (updated.count === 0) {
      await tx.booking.updateMany({
        where: { id: payment.bookingId, status: { not: "paid" } },
        data: { status: "paid" },
      });
      return false;
    }

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: "paid" },
    });
    return true;
  });

  if (transitioned) {
    try {
      await sendBookingPaidEmails(payment.bookingId);
    } catch (error) {
      Sentry.captureException(error);
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          guestEmailStatus: "failed",
          officeEmailStatus: "failed",
        },
      });
    }
  }

  return { bookingId: payment.bookingId, alreadyPaid: !transitioned };
}

export async function abandonPendingCheckout(bookingId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.booking.updateMany({
      where: { id: bookingId, status: "pending" },
      data: { status: "cancelled" },
    });
    await tx.payment.updateMany({
      where: { bookingId, status: "pending" },
      data: { status: "failed" },
    });
    await tx.tripApplication.updateMany({
      where: { bookingId },
      data: { status: "released", read: true },
    });
  });
}

export async function cancelExpiredStripeSession(stripeSessionId: string) {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId },
  });

  if (!payment || payment.status !== "pending") return;

  await abandonPendingCheckout(payment.bookingId);
}
