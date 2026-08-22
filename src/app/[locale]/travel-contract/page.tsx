import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { createMetadata } from "@/lib/seo";
import { LEGAL_DOCS } from "@/data/legal-docs";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("contractTitle"),
    description: t("contractDescription"),
    path: "/travel-contract",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function TravelContractPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contract");

  return (
    <LegalDocumentPage
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      intro={t("intro")}
      downloadLabel={t("downloadPdf")}
      viewerTitle={t("viewerTitle")}
      pdfHref={LEGAL_DOCS.contractPdf}
    />
  );
}
