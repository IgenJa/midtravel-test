import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TripEditorForm } from "@/components/admin/TripEditorForm";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminNewTripPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <>
      <SectionHeading
        eyebrow={t("navTrips")}
        title={t("newTrip")}
        description={t("tripEditorDescription")}
        align="left"
      />
      <div className="mt-8">
        <TripEditorForm />
      </div>
    </>
  );
}
