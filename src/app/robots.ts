import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";

const privatePrefixes = [
  "/admin",
  "/profile",
  "/login",
  "/register",
  "/booking",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/api/",
    "/uploads/",
    ...locales.flatMap((locale) =>
      privatePrefixes.map((prefix) => `/${locale}${prefix}`)
    ),
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
