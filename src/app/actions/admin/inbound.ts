"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { deliverApplicationEmails, deliverContactEmails } from "@/lib/inbound-emails";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/session";

export type AdminInboundResult =
  | { ok: true }
  | {
      ok: false;
      code: "UNAUTHORIZED" | "NOT_FOUND" | "SAVE_FAILED" | "RESEND_FAILED";
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
