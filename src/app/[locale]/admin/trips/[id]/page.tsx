import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  TripEditorForm,
  type TripEditorInitial,
} from "@/components/admin/TripEditorForm";
import { getTripByIdForAdmin } from "@/lib/content/trips";
import type { TripDay, TripFaq } from "@/types";

type Props = { params: Promise<{ locale: string; id: string }> };

function asDays(value: unknown): TripDay[] {
  if (!Array.isArray(value)) return [];
  return value as TripDay[];
}

function asFaqs(value: unknown): TripFaq[] {
  if (!Array.isArray(value)) return [];
  return value as TripFaq[];
}

export default async function AdminEditTripPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const trip = await getTripByIdForAdmin(id);
  if (!trip) notFound();

  const hu = trip.translations.find((item) => item.locale === "hu");
  const en = trip.translations.find((item) => item.locale === "en");

  const initial: TripEditorInitial = {
    id: trip.id,
    slug: trip.slug,
    price: trip.price,
    duration: trip.duration,
    heroImage: trip.heroImage,
    gallery: trip.gallery,
    difficulty: trip.difficulty,
    departureDates: trip.departureDates.map((date) =>
      date.toISOString().slice(0, 10)
    ),
    featured: trip.featured,
    published: trip.published,
    hu: {
      title: hu?.title ?? "",
      country: hu?.country ?? "",
      meetingPoint: hu?.meetingPoint ?? "",
      shortDescription: hu?.shortDescription ?? "",
      description: hu?.description ?? "",
      program: asDays(hu?.program),
      included: hu?.included ?? [],
      notIncluded: hu?.notIncluded ?? [],
      faq: asFaqs(hu?.faq),
    },
    en: {
      title: en?.title ?? "",
      country: en?.country ?? "",
      meetingPoint: en?.meetingPoint ?? "",
      shortDescription: en?.shortDescription ?? "",
      description: en?.description ?? "",
      program: asDays(en?.program),
      included: en?.included ?? [],
      notIncluded: en?.notIncluded ?? [],
      faq: asFaqs(en?.faq),
    },
  };

  return (
    <>
      <SectionHeading
        eyebrow={t("navTrips")}
        title={t("editTrip")}
        description={t("tripEditorDescription")}
        align="left"
      />
      <div className="mt-8">
        <TripEditorForm initial={initial} />
      </div>
    </>
  );
}
