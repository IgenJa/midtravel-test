import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { BookingInvoicePanel } from "@/components/admin/BookingInvoicePanel";
import { EmailDeliveryPanel } from "@/components/admin/EmailDeliveryPanel";
import { LegalAcceptancePanel } from "@/components/admin/LegalAcceptancePanel";
import { ResendNotifyEmailsButton } from "@/components/admin/ResendNotifyEmailsButton";
import { legalDocumentHref } from "@/data/legal-docs";
import { prisma } from "@/lib/prisma";
import { parseBillingAddress } from "@/lib/billing-address";
import { createMetadata } from "@/lib/seo";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("adminBookingsTitle"),
    description: t("adminDescription"),
    path: "/admin/bookings",
    locale: locale as Locale,
    siteTagline: t("siteTagline"),
  });
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-teal-100 text-teal-800";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export default async function AdminBookingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
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
        take: 3,
      },
      invoice: true,
      tripApplication: { select: { id: true } },
    },
  });

  if (!booking) notFound();

  const tripTitle =
    booking.trip.translations.find((item) => item.locale === locale)?.title ??
    booking.trip.translations.find((item) => item.locale === "en")?.title ??
    booking.trip.translations[0]?.title ??
    booking.trip.slug;

  const address = parseBillingAddress(booking.billingAddress);
  const latestPayment = booking.payments[0] ?? null;
  const alreadyIssued = Boolean(
    booking.invoice?.invoiceNumber && booking.invoice.issuedAt
  );

  return (
    <>
      <div className="mb-6">
        <Button href="/admin/bookings" size="sm" variant="ghost">
          ← {t("backToBookings")}
        </Button>
      </div>

      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("bookingDetailTitle")}
        description={tripTitle}
        align="left"
      />

      <div className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("status")}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(booking.status)}`}
          >
            {t(`bookingStatus.${booking.status}`)}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("bookingAmount")}
          </p>
          <p className="mt-2 font-medium text-slate-900">
            {formatPrice(booking.amount)}
          </p>
          <p className="text-xs text-slate-500">
            {booking.participants}×
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("bookingDeposit")}
          </p>
          <p className="mt-2 font-medium text-slate-900">
            {latestPayment ? formatPrice(latestPayment.amount) : "—"}
          </p>
          {latestPayment && (
            <p className="text-xs text-slate-500">
              {t(`paymentStatus.${latestPayment.status}`)}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("bookingDate")}
          </p>
          <p className="mt-2 font-medium text-slate-900">
            {formatDate(booking.createdAt.toISOString(), locale)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldCompanion")}
          </p>
          {booking.companionName ? (
            <>
              <p className="mt-2 font-medium text-slate-900">
                {booking.companionName}
              </p>
              {booking.companionPhone && (
                <a
                  href={`tel:${booking.companionPhone}`}
                  className="text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  {booking.companionPhone}
                </a>
              )}
            </>
          ) : (
            <p className="mt-2 text-slate-600">{t("companionNone")}</p>
          )}
        </div>
      </div>

      <LegalAcceptancePanel
        acceptedAt={
          booking.termsAcceptedAt
            ? formatDateTime(booking.termsAcceptedAt.toISOString(), locale)
            : null
        }
        privacy={{
          label: t("legalPrivacyDoc"),
          version: booking.privacyDocVersion,
          sha256: booking.privacyDocSha256,
          href: legalDocumentHref("privacy", booking.privacyDocVersion),
        }}
        contract={{
          label: t("legalContractDoc"),
          version: booking.contractDocVersion,
          sha256: booking.contractDocSha256,
          href: legalDocumentHref("contract", booking.contractDocVersion),
        }}
        labels={{
          title: t("legalAcceptanceTitle"),
          acceptedAt: t("legalAcceptedAt"),
          hash: t("legalDocHash"),
          missing: t("legalAcceptanceMissing"),
          openPdf: t("legalOpenPdf"),
        }}
      />

      {booking.tripApplication ? (
        <div className="mt-4">
          <Button
            href={`/admin/inbound/applications/${booking.tripApplication.id}`}
            size="sm"
            variant="outline"
          >
            {t("openLinkedApplication")}
          </Button>
        </div>
      ) : null}

      {booking.notes && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
          {booking.notes}
        </div>
      )}

      <EmailDeliveryPanel
        guestEmailStatus={booking.guestEmailStatus}
        officeEmailStatus={booking.officeEmailStatus}
        labels={{
          guest: t("emailGuestStatus"),
          office: t("emailOfficeStatus"),
          pending: t("emailSendStatus.pending"),
          sent: t("emailSendStatus.sent"),
          failed: t("emailSendStatus.failed"),
          warning: t("emailFailedWarning"),
        }}
      >
        {booking.status === "paid" ? (
          <ResendNotifyEmailsButton kind="booking" id={booking.id} />
        ) : (
          <p className="text-sm text-slate-600">{t("emailResendOnlyPaid")}</p>
        )}
      </EmailDeliveryPanel>

      <BookingInvoicePanel
        bookingId={booking.id}
        canIssue={booking.status === "paid"}
        alreadyIssued={alreadyIssued}
        invoiceNumber={booking.invoice?.invoiceNumber ?? null}
        pdfUrl={booking.invoice?.pdfUrl ?? null}
        lastError={booking.invoice?.errorMessage ?? null}
        initial={{
          customerName: booking.customerName ?? booking.user.name,
          customerEmail: booking.customerEmail ?? booking.user.email,
          customerPhone:
            booking.customerPhone ?? booking.user.phone ?? "",
          taxId: booking.taxId ?? "",
          billingZip: address?.zip ?? "",
          billingCity: address?.city ?? "",
          billingStreet: address?.street ?? "",
          billingCountry: address?.country ?? "HU",
        }}
      />
    </>
  );
}
