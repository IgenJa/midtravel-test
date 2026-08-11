import { prisma } from "@/lib/prisma";
import { withTripImageFallback } from "@/lib/trip-images";
import type { Locale } from "@/i18n/routing";
import type { Trip, TripDay, TripFaq } from "@/types";
import type { Difficulty, Prisma } from "@/generated/prisma";

type TripWithTranslations = Prisma.TripGetPayload<{
  include: { translations: true };
}>;

function asTripDays(value: unknown): TripDay[] {
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

function asTripFaqs(value: unknown): TripFaq[] {
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
  trip: TripWithTranslations,
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
    departureDates: trip.departureDates.map(
      (date) => date.toISOString().slice(0, 10)
    ),
    meetingPoint: translation.meetingPoint,
    difficulty: trip.difficulty,
    faq: asTripFaqs(translation.faq),
    featured: trip.featured,
  });
}

export async function getTrips(locale: Locale): Promise<Trip[]> {
  const rows = await prisma.trip.findMany({
    where: { published: true },
    include: { translations: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });

  return rows
    .map((trip) => mapTripToLocale(trip, locale))
    .filter((trip): trip is Trip => trip !== null);
}

export async function getAllTripsForAdmin(): Promise<TripWithTranslations[]> {
  return prisma.trip.findMany({
    include: { translations: true },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getTripBySlug(
  slug: string,
  locale: Locale
): Promise<Trip | undefined> {
  const trip = await prisma.trip.findFirst({
    where: { slug, published: true },
    include: { translations: true },
  });

  if (!trip) return undefined;
  return mapTripToLocale(trip, locale) ?? undefined;
}

export async function getTripByIdForAdmin(
  id: string
): Promise<TripWithTranslations | null> {
  return prisma.trip.findUnique({
    where: { id },
    include: { translations: true },
  });
}

export async function getFeaturedTrips(locale: Locale): Promise<Trip[]> {
  const trips = await getTrips(locale);
  return trips.filter((trip) => trip.featured);
}

export async function getAllTripSlugs(): Promise<string[]> {
  const rows = await prisma.trip.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => row.slug);
}

export async function getTripOptions(
  locale: Locale
): Promise<
  { slug: string; title: string; country: string; duration: number; price: number }[]
> {
  const trips = await getTrips(locale);
  return trips.map((trip) => ({
    slug: trip.slug,
    title: trip.title,
    country: trip.country,
    duration: trip.duration,
    price: trip.price,
  }));
}

export type { TripWithTranslations, Difficulty };
