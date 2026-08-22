import { describe, expect, it } from "vitest";
import type { Trip } from "@/types";
import {
  createDefaultTripFilters,
  filterTrips,
  getUniqueCountries,
  getUniqueDurations,
  hasActiveFilters,
} from "@/lib/trip-filters";

const trips: Trip[] = [
  {
    id: "1",
    slug: "iceland",
    title: "Iceland",
    country: "Iceland",
    price: 1890,
    duration: 8,
    shortDescription: "",
    description: "",
    heroImage: "/trips/iceland.jpg",
    gallery: [],
    program: [],
    included: [],
    notIncluded: [],
    departureDates: [],
    meetingPoint: "",
    difficulty: "Moderate",
    faq: [],
  },
  {
    id: "2",
    slug: "portugal",
    title: "Portugal",
    country: "Portugal",
    price: 990,
    duration: 6,
    shortDescription: "",
    description: "",
    heroImage: "/trips/portugal.jpg",
    gallery: [],
    program: [],
    included: [],
    notIncluded: [],
    departureDates: [],
    meetingPoint: "",
    difficulty: "Easy",
    faq: [],
  },
];

describe("filterTrips", () => {
  it("filters by difficulty, country, duration and price preset", () => {
    const defaults = createDefaultTripFilters(trips);

    expect(
      filterTrips(trips, { ...defaults, difficulty: "Easy" }).map((t) => t.slug)
    ).toEqual(["portugal"]);

    expect(
      filterTrips(trips, { ...defaults, country: "Iceland" }).map((t) => t.slug)
    ).toEqual(["iceland"]);

    expect(
      filterTrips(trips, { ...defaults, duration: 8 }).map((t) => t.slug)
    ).toEqual(["iceland"]);

    expect(
      filterTrips(trips, { ...defaults, priceRange: "under1000" }).map(
        (t) => t.slug
      )
    ).toEqual(["portugal"]);

    expect(
      filterTrips(trips, {
        ...defaults,
        priceRange: "custom",
        priceMin: 1800,
        priceMax: 2000,
      }).map((t) => t.slug)
    ).toEqual(["iceland"]);
  });
});

describe("hasActiveFilters / unique lists", () => {
  it("detects non-default filters and lists countries / durations", () => {
    const defaults = createDefaultTripFilters(trips);
    expect(hasActiveFilters(defaults)).toBe(false);
    expect(hasActiveFilters({ ...defaults, country: "Iceland" })).toBe(true);
    expect(getUniqueCountries(trips)).toEqual(["Iceland", "Portugal"]);
    expect(getUniqueDurations(trips)).toEqual([6, 8]);
  });
});
