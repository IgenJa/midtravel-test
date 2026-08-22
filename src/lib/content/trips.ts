import { prisma } from "@/lib/prisma";
import { mapTripToLocale } from "@/lib/content/trip-map";
import type { Locale } from "@/i18n/routing";
import type { Trip } from "@/types";
import type { Difficulty, Prisma } from "@/generated/prisma";
import { buildCapacitySnapshot, type TripCapacitySnapshot } from "@/lib/trip-capacity";
import {
  getOccupiedSeatsByTripIds,
  getTripCapacitySnapshot,
} from "@/lib/trip-capacity-db";

type TripWithTranslations = Prisma.TripGetPayload<{
  include: { translations: true };
}>;

export { mapTripToLocale };

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

export type TripOption = {
  slug: string;
  title: string;
  country: string;
  duration: number;
  price: number;
  remainingSeats: number;
  isFull: boolean;
};

export async function getTripOptions(locale: Locale): Promise<TripOption[]> {
  const rows = await prisma.trip.findMany({
    where: { published: true },
    include: { translations: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });
  const occupancy = await getOccupiedSeatsByTripIds(rows.map((row) => row.id));

  return rows
    .map((trip) => {
      const mapped = mapTripToLocale(trip, locale);
      if (!mapped) return null;
      const snapshot = buildCapacitySnapshot(
        trip.id,
        trip.maxCapacity,
        trip.overbookLimit,
        occupancy.get(trip.id) ?? 0
      );
      return {
        slug: mapped.slug,
        title: mapped.title,
        country: mapped.country,
        duration: mapped.duration,
        price: mapped.price,
        remainingSeats: snapshot.remainingSeats,
        isFull: snapshot.isFull,
      };
    })
    .filter((trip): trip is TripOption => trip !== null);
}

export async function getTripCapacityForSlug(
  slug: string
): Promise<TripCapacitySnapshot | null> {
  const trip = await prisma.trip.findFirst({
    where: { slug, published: true },
    select: { id: true },
  });
  if (!trip) return null;
  return getTripCapacitySnapshot(trip.id);
}

export type { TripWithTranslations, Difficulty };
