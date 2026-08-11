"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import {
  issueBookingInvoice,
  updateBookingBilling,
  type BookingBillingInput,
} from "@/app/actions/admin/bookings";

export type BookingInvoicePanelProps = {
  bookingId: string;
  canIssue: boolean;
  alreadyIssued: boolean;
  invoiceNumber: string | null;
  pdfUrl: string | null;
  lastError: string | null;
  initial: BookingBillingInput;
};

export function BookingInvoicePanel({
  bookingId,
  canIssue,
  alreadyIssued,
  invoiceNumber,
  pdfUrl,
  lastError,
  initial,
}: BookingInvoicePanelProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(lastError);

  function updateField<K extends keyof BookingBillingInput>(
    key: K,
    value: BookingBillingInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function mapErrorCode(code: string, detail?: string) {
    const known = [
      "UNAUTHORIZED",
      "NOT_FOUND",
      "VALIDATION",
      "MISSING_BILLING",
      "NOT_PAID",
      "ALREADY_ISSUED",
      "NOT_CONFIGURED",
      "MISSING_EXCHANGE_RATE",
      "ISSUE_FAILED",
    ] as const;
    const message = known.includes(code as (typeof known)[number])
      ? t(`invoiceErrors.${code as (typeof known)[number]}`)
      : t("invoiceErrors.ISSUE_FAILED");
    return detail ? `${message} ${detail}` : message;
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-xl font-bold text-slate-900">
          {t("billingTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t("billingDescription")}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {t("fieldName")}
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.customerName}
              disabled={alreadyIssued || pending}
              onChange={(e) => updateField("customerName", e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {t("fieldEmail")}
            </span>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.customerEmail}
              disabled={alreadyIssued || pending}
              onChange={(e) => updateField("customerEmail", e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {t("fieldPhone")}
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.customerPhone}
              disabled={alreadyIssued || pending}
              onChange={(e) => updateField("customerPhone", e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {t("fieldTaxId")}
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.taxId}
              disabled={alreadyIssued || pending}
              onChange={(e) => updateField("taxId", e.target.value)}
              placeholder="12345678-1-12"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {t("fieldBillingZip")}
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.billingZip}
              disabled={alreadyIssued || pending}
              onChange={(e) => updateField("billingZip", e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {t("fieldBillingCity")}
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.billingCity}
              disabled={alreadyIssued || pending}
              onChange={(e) => updateField("billingCity", e.target.value)}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">
              {t("fieldBillingStreet")}
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.billingStreet}
              disabled={alreadyIssued || pending}
              onChange={(e) => updateField("billingStreet", e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              {t("fieldBillingCountry")}
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.billingCountry}
              disabled={alreadyIssued || pending}
              onChange={(e) => updateField("billingCountry", e.target.value)}
            />
          </label>
        </div>

        {!alreadyIssued && (
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setMessage(null);
                  setError(null);
                  const result = await updateBookingBilling(bookingId, form);
                  if (!result.ok) {
                    setError(mapErrorCode(result.code, result.message));
                    return;
                  }
                  setMessage(t("billingSaved"));
                  router.refresh();
                })
              }
            >
              {pending ? t("saving") : t("saveBilling")}
            </Button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-xl font-bold text-slate-900">
          {t("invoiceTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t("invoiceDescription")}</p>

        {alreadyIssued ? (
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">{t("invoiceNumber")}:</span>{" "}
              {invoiceNumber}
            </p>
            {pdfUrl && (
              <p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-teal-700 underline"
                >
                  {t("downloadInvoicePdf")}
                </a>
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              disabled={pending || !canIssue}
              onClick={() =>
                startTransition(async () => {
                  setMessage(null);
                  setError(null);
                  if (!window.confirm(t("confirmIssueInvoice"))) return;

                  const saveResult = await updateBookingBilling(bookingId, form);
                  if (!saveResult.ok) {
                    setError(mapErrorCode(saveResult.code, saveResult.message));
                    return;
                  }

                  const result = await issueBookingInvoice(bookingId);
                  if (!result.ok) {
                    setError(mapErrorCode(result.code, result.message));
                    router.refresh();
                    return;
                  }

                  setMessage(
                    t("invoiceIssued", {
                      number: result.invoiceNumber ?? "",
                    })
                  );
                  router.refresh();
                })
              }
            >
              {pending ? t("issuingInvoice") : t("issueInvoice")}
            </Button>
            {!canIssue && (
              <p className="text-sm text-amber-700">{t("invoiceOnlyWhenPaid")}</p>
            )}
          </div>
        )}

        {message && (
          <p className="mt-4 text-sm font-medium text-teal-700">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
        )}
      </section>
    </div>
  );
}
