"use server";

import { writeFile } from "fs/promises";
import path from "path";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/session";
import {
  isCompleteBillingAddress,
  parseBillingAddress,
  serializeBillingAddress,
  type BillingAddress,
} from "@/lib/billing-address";
import { sendBookingPaidEmails } from "@/lib/bookings";
import { ensureUploadDir } from "@/lib/uploads";
import {
  isSzamlazzConfigured,
  issueSzamlazzInvoice,
} from "@/lib/szamlazz";

export type BookingBillingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  taxId: string;
  billingZip: string;
  billingCity: string;
  billingStreet: string;
  billingCountry: string;
};

export type AdminBookingActionResult =
  | { ok: true; invoiceNumber?: string; pdfUrl?: string | null }
  | {
      ok: false;
      code:
        | "UNAUTHORIZED"
        | "NOT_FOUND"
        | "VALIDATION"
        | "MISSING_BILLING"
        | "NOT_PAID"
        | "ALREADY_ISSUED"
        | "NOT_CONFIGURED"
        | "MISSING_EXCHANGE_RATE"
        | "ISSUE_FAILED"
        | "SAVE_FAILED"
        | "RESEND_FAILED";
      message?: string;
    };

async function requireAdminSession() {
  const session = await getSession();
  if (!session || !isAdminRole(session.user.role)) return null;
  return session;
}

function revalidateBookingPages() {
  revalidatePath("/[locale]/admin", "layout");
  revalidatePath("/[locale]/admin/bookings", "layout");
}

export async function setBookingRead(
  id: string,
  read: boolean
): Promise<AdminBookingActionResult> {
  if (!(await requireAdminSession())) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  try {
    const existing = await prisma.booking.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return { ok: false, code: "NOT_FOUND" };

    await prisma.booking.update({ where: { id }, data: { read } });
    revalidateBookingPages();
    return { ok: true };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}

function normalizeBilling(input: BookingBillingInput): {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  taxId: string;
  address: BillingAddress;
} {
  return {
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerPhone: input.customerPhone.trim(),
    taxId: input.taxId.trim(),
    address: {
      zip: input.billingZip.trim(),
      city: input.billingCity.trim(),
      street: input.billingStreet.trim(),
      country: (input.billingCountry.trim() || "HU").toUpperCase(),
    },
  };
}

export async function updateBookingBilling(
  bookingId: string,
  input: BookingBillingInput
): Promise<AdminBookingActionResult> {
  if (!(await requireAdminSession())) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  const data = normalizeBilling(input);
  if (
    !data.customerName ||
    !data.customerEmail ||
    !data.taxId ||
    !isCompleteBillingAddress(data.address)
  ) {
    return { ok: false, code: "VALIDATION" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!booking) return { ok: false, code: "NOT_FOUND" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || null,
      taxId: data.taxId,
      billingAddress: serializeBillingAddress(data.address),
    },
  });

  revalidateBookingPages();
  return { ok: true };
}

export async function issueBookingInvoice(
  bookingId: string
): Promise<AdminBookingActionResult> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  if (!isSzamlazzConfigured()) {
    return { ok: false, code: "NOT_CONFIGURED" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      invoice: true,
      payments: {
        where: { status: "paid" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      trip: {
        include: {
          translations: {
            where: { locale: { in: ["hu", "en"] } },
            select: { locale: true, title: true },
          },
        },
      },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!booking) return { ok: false, code: "NOT_FOUND" };

  if (booking.invoice?.invoiceNumber && booking.invoice.issuedAt) {
    return {
      ok: false,
      code: "ALREADY_ISSUED",
      message: booking.invoice.invoiceNumber,
    };
  }

  if (booking.status !== "paid") {
    return { ok: false, code: "NOT_PAID" };
  }

  const paidPayment = booking.payments[0];
  if (!paidPayment) {
    return { ok: false, code: "NOT_PAID" };
  }

  const customerName =
    booking.customerName?.trim() || booking.user.name.trim();
  const customerEmail =
    booking.customerEmail?.trim() || booking.user.email.trim();
  const customerPhone =
    booking.customerPhone?.trim() || booking.user.phone?.trim() || null;
  const taxId = booking.taxId?.trim() ?? "";
  const address = parseBillingAddress(booking.billingAddress);

  if (!customerName || !customerEmail || !taxId || !isCompleteBillingAddress(address)) {
    return { ok: false, code: "MISSING_BILLING" };
  }

  const tripTitle =
    booking.trip.translations.find((item) => item.locale === "hu")?.title ??
    booking.trip.translations.find((item) => item.locale === "en")?.title ??
    booking.trip.slug;

  const isDeposit = paidPayment.amount < booking.amount;
  const invoiceAmount = paidPayment.amount;

  // Optimistic lock row so parallel clicks don't double-issue.
  const placeholder = await prisma.invoice.upsert({
    where: { bookingId },
    create: {
      bookingId,
      issuedByUserId: session.user.id,
      errorMessage: null,
    },
    update: {
      issuedByUserId: session.user.id,
      errorMessage: null,
    },
  });

  if (placeholder.invoiceNumber && placeholder.issuedAt) {
    return {
      ok: false,
      code: "ALREADY_ISSUED",
      message: placeholder.invoiceNumber,
    };
  }

  try {
    const result = await issueSzamlazzInvoice({
      orderNumber: booking.id,
      buyer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        taxId,
        address,
      },
      item: {
        name: isDeposit
          ? `${tripTitle} — előleg`
          : tripTitle,
        comment: `${booking.participants} résztvevő · foglalás ${booking.id}`,
        grossAmount: invoiceAmount,
        quantity: 1,
      },
      prepayment: isDeposit,
      paid: true,
      paymentMethod: "bankkártya",
      currency: booking.currency || "EUR",
      language: "hu",
      comment: [
        `Foglalás: ${booking.id}`,
        isDeposit
          ? `Előleg a teljes ${booking.amount} ${booking.currency} árból`
          : null,
        booking.notes,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (!result.ok) {
      await prisma.invoice.update({
        where: { id: placeholder.id },
        data: {
          errorMessage: `[${result.code}] ${result.message}`.slice(0, 1000),
        },
      });

      if (result.code === "MISSING_EXCHANGE_RATE") {
        return { ok: false, code: "MISSING_EXCHANGE_RATE", message: result.message };
      }

      const duplicateOrder =
        /rendel[eé]ssz[aá]m|már létező|already exists/i.test(result.message);
      if (duplicateOrder) {
        return {
          ok: false,
          code: "ALREADY_ISSUED",
          message: result.message,
        };
      }

      return {
        ok: false,
        code: "ISSUE_FAILED",
        message: result.message,
      };
    }

    let pdfUrl: string | null = null;
    if (result.pdfBase64) {
      const dir = await ensureUploadDir("invoices");
      const filename = `${booking.id}.pdf`;
      await writeFile(
        path.join(dir, filename),
        Buffer.from(result.pdfBase64, "base64")
      );
      pdfUrl = `/api/admin/invoices/${booking.id}/pdf`;
    }

    await prisma.invoice.update({
      where: { id: placeholder.id },
      data: {
        invoiceNumber: result.invoiceNumber,
        pdfUrl,
        szamlazzId: result.customerAccountUrl,
        issuedAt: new Date(),
        issuedByUserId: session.user.id,
        errorMessage: null,
      },
    });

    revalidateBookingPages();
    return {
      ok: true,
      invoiceNumber: result.invoiceNumber,
      pdfUrl,
    };
  } catch (error) {
    Sentry.captureException(error);
    await prisma.invoice.update({
      where: { id: placeholder.id },
      data: {
        errorMessage: "Váratlan hiba a számla kiállítása közben.",
      },
    });
    return { ok: false, code: "ISSUE_FAILED" };
  }
}

export async function resendBookingNotifyEmails(
  id: string
): Promise<AdminBookingActionResult> {
  if (!(await requireAdminSession())) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!booking) return { ok: false, code: "NOT_FOUND" };
  if (booking.status !== "paid") return { ok: false, code: "NOT_PAID" };

  try {
    const sent = await sendBookingPaidEmails(booking.id);
    revalidateBookingPages();
    revalidatePath("/[locale]/admin", "layout");
    return sent ? { ok: true } : { ok: false, code: "RESEND_FAILED" };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "RESEND_FAILED" };
  }
}
