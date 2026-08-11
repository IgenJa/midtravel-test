import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/routing";
import type { Testimonial } from "@/types";
import type { Testimonial as DbTestimonial } from "@/generated/prisma";

export function mapTestimonial(
  item: DbTestimonial,
  locale: Locale
): Testimonial {
  return {
    id: item.id,
    name: item.name,
    location: locale === "hu" ? item.locationHu : item.locationEn,
    text: locale === "hu" ? item.textHu : item.textEn,
    rating: item.rating,
    avatar: item.avatar,
  };
}

export async function getTestimonials(
  locale: Locale
): Promise<Testimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return rows.map((item) => mapTestimonial(item, locale));
}

export async function getAllTestimonialsForAdmin(): Promise<DbTestimonial[]> {
  return prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTestimonialByIdForAdmin(
  id: string
): Promise<DbTestimonial | null> {
  return prisma.testimonial.findUnique({ where: { id } });
}
