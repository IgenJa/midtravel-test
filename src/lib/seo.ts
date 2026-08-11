import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://midtravel.com";
const siteName = "MidTravel";

interface PageSeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  locale?: Locale;
  siteTagline?: string;
}

export function createMetadata({
  title,
  description,
  path = "",
  image = "/opengraph-image",
  locale = "hu",
  siteTagline = "Prémium utazási élmények",
}: PageSeoOptions): Metadata {
  const localizedPath = path === "" ? `/${locale}` : `/${locale}${path}`;
  const url = `${siteUrl}${localizedPath}`;
  const fullTitle =
    path === "" ? `${siteName} | ${siteTagline}` : `${title} | ${siteName}`;
  const ogImage = image.startsWith("http")
    ? image
    : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
      languages: {
        hu: `${siteUrl}/hu${path}`,
        en: `${siteUrl}/en${path}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      type: "website",
      locale: locale === "hu" ? "hu_HU" : "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    icons: {
      icon: "/logo.png",
      apple: "/logo.png",
    },
  };
}

export { siteName, siteUrl };
