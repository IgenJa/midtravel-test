import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminNewTestimonialPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <>
      <SectionHeading
        eyebrow={t("navTestimonials")}
        title={t("newTestimonial")}
        align="left"
      />
      <div className="mt-8">
        <TestimonialForm />
      </div>
    </>
  );
}
