import type { Trip } from "@/types";

export type TripDifficulty = Trip["difficulty"];

export type PriceRange =
  | "all"
  | "under1000"
  | "1000_1299"
  | "1300_1599"
  | "1600_1899"
  | "1900_2199"
  | "2200_plus"
  | "custom";

export interface PriceBounds {
  min: number;
  max: number;
}

export interface TripFilters {
  difficulty: TripDifficulty | "all";
  country: string;
  duration: number | "all";
  priceRange: PriceRange;
  priceMin: number;
  priceMax: number;
}

export const PRICE_PRESETS: {
  value: Exclude<PriceRange, "all" | "custom">;
  min: number;
  max: number;
}[] = [
  { value: "under1000", min: 0, max: 999 },
  { value: "1000_1299", min: 1000, max: 1299 },
  { value: "1300_1599", min: 1300, max: 1599 },
  { value: "1600_1899", min: 1600, max: 1899 },
  { value: "1900_2199", min: 1900, max: 2199 },
  { value: "2200_plus", min: 2200, max: Infinity },
];

export function getPriceBounds(trips: Trip[]): PriceBounds {
  const prices = trips.map((trip) => trip.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    min: Math.floor(min / 10) * 10,
    max: Math.ceil(max / 10) * 10,
  };
}

export function createDefaultTripFilters(trips: Trip[]): TripFilters {
  const bounds = getPriceBounds(trips);

  return {
    difficulty: "all",
    country: "all",
    duration: "all",
    priceRange: "all",
    priceMin: bounds.min,
    priceMax: bounds.max,
  };
}

export const defaultTripFilters: TripFilters = {
  difficulty: "all",
  country: "all",
  duration: "all",
  priceRange: "all",
  priceMin: 0,
  priceMax: 5000,
};

export function getUniqueCountries(trips: Trip[]): string[] {
  return [...new Set(trips.map((trip) => trip.country))].sort();
}

export function getUniqueDurations(trips: Trip[]): number[] {
  return [...new Set(trips.map((trip) => trip.duration))].sort((a, b) => a - b);
}

function matchesPrice(trip: Trip, filters: TripFilters): boolean {
  if (filters.priceRange === "all") return true;

  if (filters.priceRange === "custom") {
    return trip.price >= filters.priceMin && trip.price <= filters.priceMax;
  }

  const preset = PRICE_PRESETS.find((item) => item.value === filters.priceRange);
  if (!preset) return true;

  return trip.price >= preset.min && trip.price <= preset.max;
}

export function filterTrips(trips: Trip[], filters: TripFilters): Trip[] {
  return trips.filter((trip) => {
    if (filters.difficulty !== "all" && trip.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.country !== "all" && trip.country !== filters.country) {
      return false;
    }

    if (filters.duration !== "all" && trip.duration !== filters.duration) {
      return false;
    }

    if (!matchesPrice(trip, filters)) return false;

    return true;
  });
}

export function hasActiveFilters(
  filters: TripFilters,
  bounds?: PriceBounds
): boolean {
  const priceActive =
    filters.priceRange !== "all" &&
    (filters.priceRange !== "custom" ||
      !bounds ||
      filters.priceMin !== bounds.min ||
      filters.priceMax !== bounds.max);

  return (
    filters.difficulty !== "all" ||
    filters.country !== "all" ||
    filters.duration !== "all" ||
    priceActive
  );
}
