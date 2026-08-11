import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { getTestimonialByIdForAdmin } from "@/lib/content/testimonials";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function AdminEditTestimonialPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const item = await getTestimonialByIdForAdmin(id);
  if (!item) notFound();

  return (
    <>
      <SectionHeading
        eyebrow={t("navTestimonials")}
        title={t("editTestimonial")}
        align="left"
      />
      <div className="mt-8">
        <TestimonialForm
          initial={{
            id: item.id,
            name: item.name,
            locationHu: item.locationHu,
            locationEn: item.locationEn,
            textHu: item.textHu,
            textEn: item.textEn,
            rating: item.rating,
            avatar: item.avatar,
            sortOrder: item.sortOrder,
            published: item.published,
          }}
        />
      </div>
    </>
  );
}
