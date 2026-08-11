import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Calendar, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatDate, formatPrice } from "@/lib/utils";
import type { UserBookingListItem } from "@/lib/bookings";
import type { Locale } from "@/i18n/routing";

type Props = {
  bookings: UserBookingListItem[];
  locale: Locale;
};

function statusClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-teal-100 text-teal-800";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export async function ProfileBookings({ bookings, locale }: Props) {
  const t = await getTranslations("profile");

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold text-slate-900">
        {t("bookingsTitle")}
      </h2>
      <p className="mt-2 text-slate-600">{t("bookingsDescription")}</p>

      {bookings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">{t("bookingsEmpty")}</p>
          <Link
            href="/trips"
            className="mt-4 inline-block text-sm font-semibold text-teal-700 hover:underline"
          >
            {t("bookingsBrowse")}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-40">
                  <Image
                    src={booking.tripHeroImage}
                    alt={booking.tripTitle}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/trips/${booking.tripSlug}`}
                        className="font-display text-lg font-bold text-slate-900 hover:text-teal-700"
                      >
                        {booking.tripTitle}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(booking.createdAt, locale)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(booking.status)}`}
                    >
                      {t(`bookingStatus.${booking.status}`)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {t("bookingParticipants", {
                        count: booking.participants,
                      })}
                    </span>
                    <span>
                      {t("bookingTotal")}: {formatPrice(booking.amount)}
                    </span>
                    {booking.depositAmount != null && (
                      <span>
                        {t("bookingDeposit")}:{" "}
                        {formatPrice(booking.depositAmount)}
                        {booking.depositStatus
                          ? ` (${t(`paymentStatus.${booking.depositStatus}`)})`
                          : ""}
                      </span>
                    )}
                  </div>

                  <p className="font-mono text-xs text-slate-400">
                    {booking.id}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
