import type { Trip } from "@/types";
import { tripStockImage } from "./images";

export interface TripSeed {
  id: string;
  slug: string;
  title: string;
  country: string;
  price: number;
  duration: number;
  difficulty: Trip["difficulty"];
  shortDescription: string;
  description: string;
  featured?: boolean;
  programDays: { title: string; description: string }[];
  included?: string[];
  notIncluded?: string[];
  meetingPoint: string;
}

export function createTrip(seed: TripSeed): Trip {
  const image = tripStockImage(seed.slug);

  return {
    id: seed.id,
    slug: seed.slug,
    title: seed.title,
    country: seed.country,
    price: seed.price,
    duration: seed.duration,
    difficulty: seed.difficulty,
    featured: seed.featured,
    shortDescription: seed.shortDescription,
    description: seed.description,
    heroImage: image,
    gallery: [image],
    program: seed.programDays.map((day, index) => ({
      day: index + 1,
      title: day.title,
      description: day.description,
    })),
    included: seed.included ?? [
      "Centrally located hotels",
      "Daily breakfast",
      "Guided tours and entrance fees",
      "Airport transfers",
    ],
    notIncluded: seed.notIncluded ?? [
      "International flights",
      "Travel insurance",
      "Personal expenses",
      "Optional activities",
    ],
    departureDates: ["2026-05-10", "2026-07-08", "2026-09-12", "2026-10-05"],
    meetingPoint: seed.meetingPoint,
    faq: [
      {
        question: "What is the group size?",
        answer: "Groups are limited to 16 travelers for a personal experience.",
      },
      {
        question: "Is this trip suitable for solo travelers?",
        answer: "Yes — many of our guests travel solo and quickly feel at home in the group.",
      },
    ],
  };
}
