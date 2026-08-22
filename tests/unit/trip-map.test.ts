import { describe, expect, it } from "vitest";
import {
  asTripDays,
  asTripFaqs,
  mapTripToLocale,
  type MappableTrip,
} from "@/lib/content/trip-map";
import { TRIP_IMAGE_PLACEHOLDER } from "@/lib/trip-images";

function baseTrip(
  translations: MappableTrip["translations"]
): MappableTrip {
  return {
    id: "trip-1",
    slug: "iceland",
    price: 1890,
    duration: 8,
    heroImage: "/trips/iceland.jpg",
    gallery: ["/trips/iceland.jpg"],
    difficulty: "Moderate",
    departureDates: [new Date("2026-06-01T12:00:00.000Z")],
    featured: true,
    translations,
  };
}

const hu = {
  locale: "hu",
  title: "Izland",
  country: "Izland",
  meetingPoint: "Keflavík",
  shortDescription: "Egy hét",
  description: "Leírás",
  program: [{ day: 1, title: "Reykjavík", description: "Érkezés" }],
  included: ["Idegenvezető"],
  notIncluded: ["Repülő"],
  faq: [{ question: "Vízum?", answer: "Nem kell" }],
};

const en = {
  ...hu,
  locale: "en",
  title: "Iceland",
  country: "Iceland",
  shortDescription: "One week",
  description: "Description",
};

describe("asTripDays / asTripFaqs", () => {
  it("drops malformed program and faq entries", () => {
    expect(asTripDays(null)).toEqual([]);
    expect(asTripDays("nope")).toEqual([]);
    expect(
      asTripDays([
        { day: 1, title: "OK", description: "yes" },
        { day: "x", title: "", description: "skip" },
        12,
        { title: "No day", description: "kept" },
      ])
    ).toEqual([
      { day: 1, title: "OK", description: "yes" },
      { day: 0, title: "No day", description: "kept" },
    ]);

    expect(asTripFaqs([{ question: "Q", answer: "A" }, { question: "Q" }])).toEqual(
      [{ question: "Q", answer: "A" }]
    );
  });
});

describe("mapTripToLocale", () => {
  it("prefers the requested locale and formats departure dates", () => {
    const mapped = mapTripToLocale(baseTrip([hu, en]), "en");
    expect(mapped).toMatchObject({
      title: "Iceland",
      country: "Iceland",
      departureDates: ["2026-06-01"],
      program: [{ day: 1, title: "Reykjavík" }],
      faq: [{ question: "Vízum?", answer: "Nem kell" }],
    });
  });

  it("falls back to English, then the first translation", () => {
    expect(mapTripToLocale(baseTrip([en]), "hu")?.title).toBe("Iceland");
    expect(
      mapTripToLocale(
        baseTrip([{ ...hu, locale: "de", title: "Island" }]),
        "en"
      )?.title
    ).toBe("Island");
    expect(mapTripToLocale(baseTrip([]), "hu")).toBeNull();
  });

  it("replaces known broken hero images", () => {
    const mapped = mapTripToLocale(
      {
        ...baseTrip([en]),
        heroImage:
          "https://images.unsplash.com/photo-1613395877344-13d4a8e0d325",
        gallery: [],
      },
      "en"
    );
    expect(mapped?.heroImage).toBe(TRIP_IMAGE_PLACEHOLDER);
    expect(mapped?.gallery).toEqual([TRIP_IMAGE_PLACEHOLDER]);
  });
});
