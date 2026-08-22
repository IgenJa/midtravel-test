"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/session";
import { revalidateTrips } from "@/lib/content/cache";
import type { Difficulty, Prisma } from "@/generated/prisma";
import type { TripDay, TripFaq } from "@/types";
import {
  MAX_CAPACITY_MAX,
  OVERBOOK_LIMIT_MAX,
  parseCapacityField,
} from "@/lib/trip-capacity";

export type TripTranslationInput = {
  title: string;
  country: string;
  meetingPoint: string;
  shortDescription: string;
  description: string;
  program: TripDay[];
  included: string[];
  notIncluded: string[];
  faq: TripFaq[];
};

export type TripSaveInput = {
  id?: string;
  slug: string;
  price: number;
  duration: number;
  heroImage: string;
  gallery: string[];
  difficulty: Difficulty;
  departureDates: string[];
  maxCapacity: number;
  overbookLimit: number;
  featured: boolean;
  published: boolean;
  hu: TripTranslationInput;
  en: TripTranslationInput;
};

export type AdminActionResult =
  | { ok: true; id: string }
  | {
      ok: false;
      code:
        | "UNAUTHORIZED"
        | "VALIDATION"
        | "SLUG_TAKEN"
        | "NOT_FOUND"
        | "SAVE_FAILED";
      message?: string;
    };

function cleanLines(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function cleanProgram(program: TripDay[]): TripDay[] {
  return program
    .map((day, index) => ({
      day: Number(day.day) || index + 1,
      title: day.title.trim(),
      description: day.description.trim(),
    }))
    .filter((day) => day.title.length > 0);
}

function cleanFaq(faq: TripFaq[]): TripFaq[] {
  return faq
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
}

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDates(dates: string[]): Date[] {
  return dates
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => new Date(`${value}T12:00:00.000Z`))
    .filter((date) => !Number.isNaN(date.getTime()));
}

function validateTranslation(input: TripTranslationInput): boolean {
  return Boolean(
    input.title.trim() &&
      input.country.trim() &&
      input.meetingPoint.trim() &&
      input.shortDescription.trim() &&
      input.description.trim()
  );
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || !isAdminRole(session.user.role)) return null;
  return session;
}

function translationCreate(locale: string, input: TripTranslationInput) {
  return {
    locale,
    title: input.title.trim(),
    country: input.country.trim(),
    meetingPoint: input.meetingPoint.trim(),
    shortDescription: input.shortDescription.trim(),
    description: input.description.trim(),
    program: cleanProgram(input.program) as unknown as Prisma.InputJsonValue,
    included: cleanLines(input.included),
    notIncluded: cleanLines(input.notIncluded),
    faq: cleanFaq(input.faq) as unknown as Prisma.InputJsonValue,
  };
}

export async function saveTrip(
  input: TripSaveInput
): Promise<AdminActionResult> {
  if (!(await requireAdminSession())) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  const slug = normalizeSlug(input.slug);
  const price = Number(input.price);
  const duration = Number(input.duration);
  const heroImage = input.heroImage.trim();
  const gallery = cleanLines(input.gallery);
  const departureDates = parseDates(input.departureDates);
  const maxCapacity = parseCapacityField(input.maxCapacity, {
    min: 1,
    max: MAX_CAPACITY_MAX,
  });
  const overbookLimit = parseCapacityField(input.overbookLimit, {
    min: 0,
    max: OVERBOOK_LIMIT_MAX,
  });

  if (
    !slug ||
    !heroImage ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(duration) ||
    duration < 1 ||
    maxCapacity == null ||
    overbookLimit == null ||
    !validateTranslation(input.hu) ||
    !validateTranslation(input.en)
  ) {
    return { ok: false, code: "VALIDATION" };
  }

  const difficulty = (["Easy", "Moderate", "Challenging"] as Difficulty[]).includes(
    input.difficulty
  )
    ? input.difficulty
    : "Moderate";

  try {
    const slugOwner = await prisma.trip.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (slugOwner && slugOwner.id !== input.id) {
      return { ok: false, code: "SLUG_TAKEN" };
    }

    const shared = {
      slug,
      price: Math.round(price),
      duration: Math.round(duration),
      heroImage,
      gallery: gallery.length > 0 ? gallery : [heroImage],
      difficulty,
      departureDates,
      maxCapacity,
      overbookLimit,
      featured: Boolean(input.featured),
      published: Boolean(input.published),
    };

    if (input.id) {
      const existing = await prisma.trip.findUnique({
        where: { id: input.id },
        select: { id: true },
      });
      if (!existing) return { ok: false, code: "NOT_FOUND" };

      await prisma.trip.update({
        where: { id: input.id },
        data: {
          ...shared,
          translations: {
            deleteMany: {},
            create: [
              translationCreate("hu", input.hu),
              translationCreate("en", input.en),
            ],
          },
        },
      });

      revalidateTrips();
      return { ok: true, id: input.id };
    }

    const created = await prisma.trip.create({
      data: {
        ...shared,
        translations: {
          create: [
            translationCreate("hu", input.hu),
            translationCreate("en", input.en),
          ],
        },
      },
      select: { id: true },
    });

    revalidateTrips();
    return { ok: true, id: created.id };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}

export async function deleteTrip(id: string): Promise<AdminActionResult> {
  if (!(await requireAdminSession())) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  try {
    await prisma.trip.delete({ where: { id } });
    revalidateTrips();
    return { ok: true, id };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}

export async function setTripPublished(
  id: string,
  published: boolean
): Promise<AdminActionResult> {
  if (!(await requireAdminSession())) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  try {
    await prisma.trip.update({
      where: { id },
      data: { published },
    });
    revalidateTrips();
    return { ok: true, id };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}
