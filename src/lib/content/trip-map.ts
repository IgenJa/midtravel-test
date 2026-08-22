import { withTripImageFallback } from "@/lib/trip-images";
import type { Locale } from "@/i18n/routing";
import type { Trip, TripDay, TripFaq } from "@/types";

export type MappableTripTranslation = {
  locale: string;
  title: string;
  country: string;
  meetingPoint: string;
  shortDescription: string;
  description: string;
  program: unknown;
  included: string[];
  notIncluded: string[];
  faq: unknown;
};

export type MappableTrip = {
  id: string;
  slug: string;
  price: number;
  duration: number;
  heroImage: string;
  gallery: string[];
  difficulty: Trip["difficulty"];
  departureDates: Date[];
  featured: boolean;
  translations: MappableTripTranslation[];
};

export function asTripDays(value: unknown): TripDay[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const day = item as Record<string, unknown>;
      const dayNum = Number(day.day);
      const title = typeof day.title === "string" ? day.title : "";
      const description =
        typeof day.description === "string" ? day.description : "";
      if (!title) return null;
      return {
        day: Number.isFinite(dayNum) ? dayNum : 0,
        title,
        description,
      };
    })
    .filter((item): item is TripDay => item !== null);
}

export function asTripFaqs(value: unknown): TripFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const faq = item as Record<string, unknown>;
      const question = typeof faq.question === "string" ? faq.question : "";
      const answer = typeof faq.answer === "string" ? faq.answer : "";
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is TripFaq => item !== null);
}

export function mapTripToLocale(
  trip: MappableTrip,
  locale: Locale
): Trip | null {
  const translation =
    trip.translations.find((item) => item.locale === locale) ??
    trip.translations.find((item) => item.locale === "en") ??
    trip.translations[0];

  if (!translation) return null;

  return withTripImageFallback({
    id: trip.id,
    slug: trip.slug,
    title: translation.title,
    country: translation.country,
    price: trip.price,
    duration: trip.duration,
    shortDescription: translation.shortDescription,
    description: translation.description,
    heroImage: trip.heroImage,
    gallery: trip.gallery,
    program: asTripDays(translation.program),
    included: translation.included,
    notIncluded: translation.notIncluded,
    departureDates: trip.departureDates.map((date) =>
      date.toISOString().slice(0, 10)
    ),
    meetingPoint: translation.meetingPoint,
    difficulty: trip.difficulty,
    faq: asTripFaqs(translation.faq),
    featured: trip.featured,
  });
}
