import type { Trip } from "@/types";

export const TRIP_IMAGE_PLACEHOLDER = "/trip-placeholder.svg";

const brokenImagePatterns = [
  "photo-1523906834651-6e2e0b0e0b0b",
  "photo-1529260830195-03bfe6d85605",
  "photo-1555990793-da0b0b0e0b0b",
  "photo-1562883670-4d9d0b8b0b0b",
  "photo-1613395877344-13d4a8e0d325",
  "photo-1504829857797-ddb29a287b8f",
  "photo-1513519245088-0e12902e35ca",
  "photo-1489749791425-33a4a4cb8e10",
  "photo-1506377554403-9d6d218509bf",
  "photo-1530122037265-a5fd1f786d24",
  "photo-1590089415225-32f835bc36b3",
  "photo-1467269206134-0da4c2a0d36b",
  "photo-1555992336-fb0d2c8b2473",
];

export function isBrokenTripImage(url: string): boolean {
  return brokenImagePatterns.some((pattern) => url.includes(pattern));
}

export function resolveTripImage(url: string): string {
  return isBrokenTripImage(url) ? TRIP_IMAGE_PLACEHOLDER : url;
}

export function withTripImageFallback(trip: Trip): Trip {
  const gallery = trip.gallery.map(resolveTripImage);

  return {
    ...trip,
    heroImage: resolveTripImage(trip.heroImage),
    gallery: gallery.length > 0 ? gallery : [TRIP_IMAGE_PLACEHOLDER],
  };
}
