"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/session";
import { revalidateTestimonials } from "@/lib/content/cache";

export type TestimonialSaveInput = {
  id?: string;
  name: string;
  locationHu: string;
  locationEn: string;
  textHu: string;
  textEn: string;
  rating: number;
  avatar: string;
  sortOrder: number;
  published: boolean;
};

export type AdminTestimonialResult =
  | { ok: true; id: string }
  | {
      ok: false;
      code: "UNAUTHORIZED" | "VALIDATION" | "NOT_FOUND" | "SAVE_FAILED";
    };

async function requireAdmin() {
  const session = await getSession();
  return Boolean(session && isAdminRole(session.user.role));
}

export async function saveTestimonial(
  input: TestimonialSaveInput
): Promise<AdminTestimonialResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  const name = input.name.trim();
  const locationHu = input.locationHu.trim();
  const locationEn = input.locationEn.trim();
  const textHu = input.textHu.trim();
  const textEn = input.textEn.trim();
  const avatar = input.avatar.trim() || "/profile-placeholder.svg";
  const rating = Math.round(Number(input.rating));

  if (
    !name ||
    !locationHu ||
    !locationEn ||
    !textHu ||
    !textEn ||
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return { ok: false, code: "VALIDATION" };
  }

  const data = {
    name,
    locationHu,
    locationEn,
    textHu,
    textEn,
    rating,
    avatar,
    sortOrder: Number.isFinite(input.sortOrder)
      ? Math.round(input.sortOrder)
      : 0,
    published: Boolean(input.published),
  };

  try {
    if (input.id) {
      const existing = await prisma.testimonial.findUnique({
        where: { id: input.id },
        select: { id: true },
      });
      if (!existing) return { ok: false, code: "NOT_FOUND" };

      await prisma.testimonial.update({ where: { id: input.id }, data });
      revalidateTestimonials();
      return { ok: true, id: input.id };
    }

    const created = await prisma.testimonial.create({
      data,
      select: { id: true },
    });
    revalidateTestimonials();
    return { ok: true, id: created.id };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}

export async function deleteTestimonial(
  id: string
): Promise<AdminTestimonialResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  try {
    await prisma.testimonial.delete({ where: { id } });
    revalidateTestimonials();
    return { ok: true, id };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}
