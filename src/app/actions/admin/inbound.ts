"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { deliverApplicationEmails, deliverContactEmails } from "@/lib/inbound-emails";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/session";
import { isTripCapacityFullError } from "@/lib/trip-capacity";
import { assertTripHasCapacity } from "@/lib/trip-capacity-db";

export type AdminInboundResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | "UNAUTHORIZED"
        | "NOT_FOUND"
        | "SAVE_FAILED"
        | "RESEND_FAILED"
        | "INVALID_STATUS"
        | "TRIP_FULL";
    };

async function requireAdmin() {
  const session = await getSession();
  return Boolean(session && isAdminRole(session.user.role));
}

function revalidateInbound() {
  revalidatePath("/[locale]/admin", "layout");
}

export async function setContactMessageRead(
  id: string,
  read: boolean
): Promise<AdminInboundResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  try {
    const existing = await prisma.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return { ok: false, code: "NOT_FOUND" };

    await prisma.contactMessage.update({ where: { id }, data: { read } });
    revalidateInbound();
    return { ok: true };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}

export async function setTripApplicationRead(
  id: string,
  read: boolean
): Promise<AdminInboundResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  try {
    const existing = await prisma.tripApplication.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return { ok: false, code: "NOT_FOUND" };

    await prisma.tripApplication.update({ where: { id }, data: { read } });
    revalidateInbound();
    return { ok: true };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}

export async function setTripApplicationStatus(
  id: string,
  status: "released" | "open"
): Promise<AdminInboundResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  try {
    const existing = await prisma.tripApplication.findUnique({
      where: { id },
      select: { id: true, status: true, tripId: true, participants: true },
    });
    if (!existing) return { ok: false, code: "NOT_FOUND" };

    if (status === "released") {
      if (existing.status !== "open") {
        return { ok: false, code: "INVALID_STATUS" };
      }
      await prisma.tripApplication.update({
        where: { id },
        data: { status: "released", read: true },
      });
      revalidateInbound();
      return { ok: true };
    }

    if (existing.status !== "released" || !existing.tripId) {
      return { ok: false, code: "INVALID_STATUS" };
    }

    const tripId = existing.tripId;
    await prisma.$transaction(async (tx) => {
      await assertTripHasCapacity(tx, tripId, {
        requestedSeats: existing.participants,
      });
      await tx.tripApplication.update({
        where: { id },
        data: { status: "open", read: false },
      });
    });
    revalidateInbound();
    return { ok: true };
  } catch (error) {
    if (isTripCapacityFullError(error)) {
      return { ok: false, code: "TRIP_FULL" };
    }
    if (isUniqueConstraintError(error)) {
      return { ok: false, code: "INVALID_STATUS" };
    }
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}

export async function resendContactEmails(
  id: string
): Promise<AdminInboundResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  const existing = await prisma.contactMessage.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, code: "NOT_FOUND" };

  try {
    const sent = await deliverContactEmails(id);
    revalidateInbound();
    return sent ? { ok: true } : { ok: false, code: "RESEND_FAILED" };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "RESEND_FAILED" };
  }
}

export async function resendApplicationEmails(
  id: string
): Promise<AdminInboundResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  const existing = await prisma.tripApplication.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, code: "NOT_FOUND" };

  try {
    const sent = await deliverApplicationEmails(id);
    revalidateInbound();
    return sent ? { ok: true } : { ok: false, code: "RESEND_FAILED" };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "RESEND_FAILED" };
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
