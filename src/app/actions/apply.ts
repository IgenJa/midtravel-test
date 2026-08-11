"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  applicationConfirmationHtml,
  applicationNotificationHtml,
  getNotifyEmail,
  sendEmail,
} from "@/lib/email";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
} from "@/lib/form-validation";
import type { Locale } from "@/i18n/routing";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";

export type ApplyActionInput = {
  fullName: string;
  email: string;
  phone: string;
  participants: number;
  tripSlug: string;
  message: string;
  requestInsurance: boolean;
  acceptPrivacy: boolean;
  locale?: Locale;
};

export type ApplyActionResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "VALIDATION"
        | "PRIVACY_REQUIRED"
        | "RATE_LIMITED"
        | "TRIP_NOT_FOUND"
        | "SAVE_FAILED";
      fieldErrors?: Partial<
        Record<
          "fullName" | "email" | "phone" | "participants" | "tripSlug" | "message",
          string
        >
      >;
    };

export async function submitTripApplication(
  input: ApplyActionInput
): Promise<ApplyActionResult> {
  const limited = await rateLimit("apply", RATE_LIMITS.apply);
  if (!limited.ok) {
    return { ok: false, code: "RATE_LIMITED" };
  }

  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);
  const phone = input.phone.trim();
  const tripSlug = input.tripSlug.trim();
  const message = input.message.trim() || null;
  const participants = Number(input.participants);
  const locale = input.locale ?? "hu";

  const fieldErrors: NonNullable<
    Extract<ApplyActionResult, { ok: false }>["fieldErrors"]
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

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, code: "VALIDATION", fieldErrors };
  }

  if (!input.acceptPrivacy) {
    return { ok: false, code: "PRIVACY_REQUIRED" };
  }

  const dbTrip = await prisma.trip.findFirst({
    where: { slug: tripSlug, published: true },
    select: {
      id: true,
      translations: {
        where: { locale: { in: [locale, "en", "hu"] } },
        select: { locale: true, title: true },
      },
    },
  });

  if (!dbTrip) {
    return {
      ok: false,
      code: "TRIP_NOT_FOUND",
      fieldErrors: { tripSlug: "tripSlug" },
    };
  }

  const tripTitle =
    dbTrip.translations.find((item) => item.locale === locale)?.title ??
    dbTrip.translations.find((item) => item.locale === "en")?.title ??
    dbTrip.translations[0]?.title ??
    tripSlug;

  const session = await getSession();

  try {
    await prisma.tripApplication.create({
      data: {
        fullName,
        email,
        phone,
        participants,
        tripSlug,
        tripId: dbTrip.id,
        message,
        requestInsurance: Boolean(input.requestInsurance),
        userId: session?.user.id ?? null,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }

  await Promise.all([
    sendEmail({
      to: email,
      subject: `Jelentkezésed megérkezett — ${tripTitle}`,
      html: applicationConfirmationHtml(fullName, tripTitle),
    }),
    sendEmail({
      to: getNotifyEmail(),
      subject: `Új jelentkezés: ${tripTitle}`,
      html: applicationNotificationHtml({
        fullName,
        email,
        phone,
        participants,
        tripSlug,
        tripTitle,
        message,
        requestInsurance: Boolean(input.requestInsurance),
      }),
      replyTo: email,
    }),
  ]);

  return { ok: true };
}
