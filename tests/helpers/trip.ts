import type { Trip } from "@/types";

export function sampleTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "1",
    slug: "iceland",
    title: "Iceland circumnavigation",
    country: "Iceland",
    price: 1890,
    duration: 8,
    shortDescription: "A week around the island",
    description: "Full description",
    heroImage: "/trips/iceland.jpg",
    gallery: ["/trips/iceland.jpg"],
    program: [
      { day: 1, title: "Reykjavík", description: "Arrival" },
      { day: 2, title: "South coast", description: "Waterfalls" },
    ],
    included: ["Guide"],
    notIncluded: ["Flights"],
    departureDates: ["2026-06-01"],
    meetingPoint: "Keflavík",
    difficulty: "Moderate",
    faq: [{ question: "Visa?", answer: "No" }],
    featured: true,
    ...overrides,
  };
}
