import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CompanySettingsForm } from "@/components/admin/CompanySettingsForm";
import { getCompanySettings } from "@/lib/content/company";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("adminTitle"),
    description: t("adminDescription"),
    path: "/admin/settings",
    locale: locale as Locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function AdminSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const settings = await getCompanySettings();

  return (
    <>
      <SectionHeading
        eyebrow={t("navSettings")}
        title={t("settingsTitle")}
        description={t("settingsDescription")}
        align="left"
      />
      <div className="mt-8">
        <CompanySettingsForm initial={settings} />
      </div>
    </>
  );
}
