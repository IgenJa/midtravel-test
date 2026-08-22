import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { getRobotsDisallowPaths } from "@/lib/robots-rules";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const disallow = getRobotsDisallowPaths(locales);

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
