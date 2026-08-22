import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

const staticPaths: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/trips", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/team", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/apply", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/impressum", changeFrequency: "yearly", priority: 0.3 },
  { path: "/travel-contract", changeFrequency: "yearly", priority: 0.3 },
];

function localizedUrl(locale: string, path: string) {
  return path === "" ? `${siteUrl}/${locale}` : `${siteUrl}/${locale}${path}`;
}

function languageAlternates(path: string) {
  return Object.fromEntries(
    locales.map((locale) => [locale, localizedUrl(locale, path)])
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let trips: { slug: string; updatedAt: Date }[] = [];

  try {
    trips = await prisma.trip.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // Allow build/sitemap generation when DB is temporarily unavailable.
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const { path, changeFrequency, priority } of staticPaths) {
    for (const locale of locales) {
      entries.push({
        url: localizedUrl(locale, path),
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: { languages: languageAlternates(path) },
      });
    }
  }

  for (const trip of trips) {
    const path = `/trips/${trip.slug}`;
    for (const locale of locales) {
      entries.push({
        url: localizedUrl(locale, path),
        lastModified: trip.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: languageAlternates(path) },
      });
    }
  }

  return entries;
}
