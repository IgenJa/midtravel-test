import { getCompany } from "@/data/company";
import { siteName, siteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Trip } from "@/types";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(locale: Locale): JsonLd {
  const company = getCompany(locale);

  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteName,
    description: company.description,
    url: `${siteUrl}/${locale}`,
    email: company.email,
    telephone: company.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: "Szeged",
      postalCode: "6720",
      addressCountry: "HU",
    },
    sameAs: [
      company.social.facebook,
      company.social.instagram,
      company.social.linkedin,
    ].filter(Boolean),
    image: `${siteUrl}/logo.png`,
  };
}

export function touristTripJsonLd(trip: Trip, locale: Locale): JsonLd {
  const url = `${siteUrl}/${locale}/trips/${trip.slug}`;
  const image = trip.heroImage.startsWith("http")
    ? trip.heroImage
    : `${siteUrl}${trip.heroImage.startsWith("/") ? "" : "/"}${trip.heroImage}`;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.shortDescription,
    url,
    image,
    touristType: trip.difficulty,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: trip.program.length,
      itemListElement: trip.program.map((day) => ({
        "@type": "ListItem",
        position: day.day,
        name: day.title,
        description: day.description,
      })),
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/${locale}/apply?trip=${trip.slug}`,
      price: trip.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    provider: {
      "@type": "TravelAgency",
      name: siteName,
      url: `${siteUrl}/${locale}`,
    },
  };
}
