import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { TripRowActions } from "@/components/admin/TripRowActions";
import { getAllTripsForAdmin } from "@/lib/content/trips";
import { buildCapacitySnapshot } from "@/lib/trip-capacity";
import { getOccupiedSeatsByTripIds } from "@/lib/trip-capacity-db";
import { formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminTripsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const trips = await getAllTripsForAdmin();
  const occupancy = await getOccupiedSeatsByTripIds(trips.map((trip) => trip.id));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow={t("navTrips")}
          title={t("tripsTitle")}
          description={t("tripsDescription")}
          align="left"
        />
        <Button href="/admin/trips/new">{t("newTrip")}</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("fieldTitle")}</th>
              <th className="px-4 py-3 font-semibold">{t("fieldSlug")}</th>
              <th className="px-4 py-3 font-semibold">{t("fieldPrice")}</th>
              <th className="px-4 py-3 font-semibold">{t("fieldOccupancy")}</th>
              <th className="px-4 py-3 font-semibold">{t("status")}</th>
              <th className="px-4 py-3 font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => {
              const title =
                trip.translations.find((item) => item.locale === "hu")?.title ??
                trip.translations[0]?.title ??
                trip.slug;
              const capacity = buildCapacitySnapshot(
                trip.id,
                trip.maxCapacity,
                trip.overbookLimit,
                occupancy.get(trip.id) ?? 0
              );

              return (
                <tr key={trip.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {title}
                    {trip.featured ? (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        {t("featuredBadge")}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{trip.slug}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatPrice(trip.price)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span
                      className={
                        capacity.isFull
                          ? "text-red-700"
                          : capacity.isOverbooked
                            ? "text-amber-700"
                            : undefined
                      }
                    >
                      {capacity.occupiedSeats}/{capacity.maxCapacity}
                      {capacity.overbookLimit > 0
                        ? ` +${capacity.overbookLimit}`
                        : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        trip.published
                          ? "text-teal-700"
                          : "text-slate-500"
                      }
                    >
                      {trip.published ? t("published") : t("draft")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <TripRowActions id={trip.id} published={trip.published} />
                  </td>
                </tr>
              );
            })}
            {trips.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {t("emptyTrips")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
