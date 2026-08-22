import { getResolvedCompany } from "@/lib/content/company";
import { siteName, siteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import { touristTripJsonLd } from "@/lib/json-ld-trip";

export { touristTripJsonLd };

type JsonLd = Record<string, unknown>;

export async function organizationJsonLd(locale: Locale): Promise<JsonLd> {
  const company = await getResolvedCompany(locale);

  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteName,
    description: company.description,
    url: `${siteUrl}/${locale}`,
    email: company.email,
    telephone: company.phoneHref,
    legalName: company.legalName,
    vatID: company.taxId,
    taxID: company.taxId,
    foundingDate: company.foundedDate,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.streetAddress,
      addressLocality: company.city,
      postalCode: company.postalCode,
      addressCountry: company.addressCountry,
    },
    sameAs: [company.social.facebook].filter(Boolean),
    image: `${siteUrl}/logo.png`,
  };
}

