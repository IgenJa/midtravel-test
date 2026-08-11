"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import {
  contactConfirmationHtml,
  contactNotificationHtml,
  getNotifyEmail,
  sendEmail,
} from "@/lib/email";
import { isValidEmail, normalizeEmail } from "@/lib/form-validation";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";

export type ContactActionInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  acceptPrivacy: boolean;
};

export type ContactActionResult =
  | { ok: true }
  | {
      ok: false;
      code: "VALIDATION" | "PRIVACY_REQUIRED" | "RATE_LIMITED" | "SAVE_FAILED";
      fieldErrors?: Partial<
        Record<"name" | "email" | "subject" | "message", string>
      >;
    };

export async function submitContactMessage(
  input: ContactActionInput
): Promise<ContactActionResult> {
  const limited = await rateLimit("contact", RATE_LIMITS.contact);
  if (!limited.ok) {
    return { ok: false, code: "RATE_LIMITED" };
  }

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const subject = input.subject.trim();
  const message = input.message.trim();

  const fieldErrors: NonNullable<
    Extract<ContactActionResult, { ok: false }>["fieldErrors"]
  > = {};

  if (!name || name.length < 2) fieldErrors.name = "name";
  if (!email || !isValidEmail(email)) fieldErrors.email = "email";
  if (!subject) fieldErrors.subject = "subject";
  if (!message || message.length < 10) fieldErrors.message = "message";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, code: "VALIDATION", fieldErrors };
  }

  if (!input.acceptPrivacy) {
    return { ok: false, code: "PRIVACY_REQUIRED" };
  }

  try {
    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }

  await Promise.all([
    sendEmail({
      to: email,
      subject: "Megkaptuk az üzenetedet — MidTravel",
      html: contactConfirmationHtml(name),
    }),
    sendEmail({
      to: getNotifyEmail(),
      subject: `Kapcsolat: ${subject}`,
      html: contactNotificationHtml({ name, email, subject, message }),
      replyTo: email,
    }),
  ]);

  return { ok: true };
}
