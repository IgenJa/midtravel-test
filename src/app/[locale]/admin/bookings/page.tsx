import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmailFailedBadge } from "@/components/admin/EmailFailedBadge";
import { hasFailedEmail } from "@/lib/email-delivery";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
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

export default async function AdminBookingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
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
      invoice: {
        select: { invoiceNumber: true, issuedAt: true },
      },
    },
  });

  return (
    <>
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("bookingsTitle")}
        description={t("bookingsDescription")}
        align="left"
      />

      {bookings.length === 0 ? (
        <p className="mt-8 text-slate-600">{t("emptyBookings")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("fieldName")}</th>
                <th className="px-4 py-3 font-semibold">{t("fieldTitle")}</th>
                <th className="px-4 py-3 font-semibold">{t("bookingAmount")}</th>
                <th className="px-4 py-3 font-semibold">{t("bookingDeposit")}</th>
                <th className="px-4 py-3 font-semibold">{t("status")}</th>
                <th className="px-4 py-3 font-semibold">{t("invoiceColumn")}</th>
                <th className="px-4 py-3 font-semibold">{t("bookingDate")}</th>
                <th className="px-4 py-3 font-semibold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const tripTitle =
                  booking.trip.translations.find((item) => item.locale === locale)
                    ?.title ??
                  booking.trip.translations.find((item) => item.locale === "en")
                    ?.title ??
                  booking.trip.translations[0]?.title ??
                  booking.trip.slug;
                const payment = booking.payments[0];
                const hasInvoice = Boolean(
                  booking.invoice?.invoiceNumber && booking.invoice.issuedAt
                );
                const emailFailed = hasFailedEmail(booking);

                return (
                  <tr
                    key={booking.id}
                    className={cn(
                      "border-b border-slate-100",
                      emailFailed && "bg-red-50/60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {booking.customerName ?? booking.user.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {booking.customerEmail ?? booking.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{tripTitle}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatPrice(booking.amount)}
                      <div className="text-xs text-slate-500">
                        {booking.participants}×
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {payment ? formatPrice(payment.amount) : "—"}
                      {payment && (
                        <div className="text-xs text-slate-500">
                          {t(`paymentStatus.${payment.status}`)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(booking.status)}`}
                        >
                          {t(`bookingStatus.${booking.status}`)}
                        </span>
                        <EmailFailedBadge
                          guestEmailStatus={booking.guestEmailStatus}
                          officeEmailStatus={booking.officeEmailStatus}
                          label={t("emailFailedBadge")}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {hasInvoice ? (
                        <span className="font-medium text-teal-800">
                          {booking.invoice?.invoiceNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(booking.createdAt.toISOString(), locale)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="text-sm font-semibold text-teal-700 hover:text-teal-800"
                      >
                        {t("openBooking")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
