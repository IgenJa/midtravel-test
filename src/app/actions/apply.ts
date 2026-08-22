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
import { deliverApplicationEmails } from "@/lib/inbound-emails";
import type { Locale } from "@/i18n/routing";
import { parseLocale } from "@/lib/locale";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { isTripCapacityFullError } from "@/lib/trip-capacity";
import { assertTripHasCapacity } from "@/lib/trip-capacity-db";

export type ApplyActionInput = {
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

export type ApplyActionResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "VALIDATION"
        | "PRIVACY_REQUIRED"
        | "RATE_LIMITED"
        | "TRIP_NOT_FOUND"
        | "TRIP_FULL"
        | "SAVE_FAILED";
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
  const locale = parseLocale(input.locale);

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

  let createdId: string;
  try {
    const created = await prisma.$transaction(async (tx) => {
      await assertTripHasCapacity(tx, dbTrip.id);
      return tx.tripApplication.create({
        data: {
          fullName,
          email,
          phone,
          participants,
          tripSlug,
          tripId: dbTrip.id,
          message,
          requestInsurance: Boolean(input.requestInsurance),
          companionName: companionValue.companionName,
          companionPhone: companionValue.companionPhone,
          locale,
          userId: session?.user.id ?? null,
        },
      });
    });
    createdId = created.id;
  } catch (error) {
    if (isTripCapacityFullError(error)) {
      return { ok: false, code: "TRIP_FULL" };
    }
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }

  try {
    await deliverApplicationEmails(createdId, tripTitle);
  } catch (error) {
    Sentry.captureException(error);
    await prisma.tripApplication.update({
      where: { id: createdId },
      data: {
        guestEmailStatus: "failed",
        officeEmailStatus: "failed",
      },
    });
  }

  return { ok: true };
}
