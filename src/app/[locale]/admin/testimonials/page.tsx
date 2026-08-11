import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { TestimonialRowActions } from "@/components/admin/TestimonialRowActions";
import { getAllTestimonialsForAdmin } from "@/lib/content/testimonials";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminTestimonialsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const items = await getAllTestimonialsForAdmin();

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow={t("navTestimonials")}
          title={t("testimonialsTitle")}
          description={t("testimonialsDescription")}
          align="left"
        />
        <Button href="/admin/testimonials/new">{t("newTestimonial")}</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("fieldName")}</th>
              <th className="px-4 py-3 font-semibold">{t("fieldLocationHu")}</th>
              <th className="px-4 py-3 font-semibold">{t("fieldRating")}</th>
              <th className="px-4 py-3 font-semibold">{t("status")}</th>
              <th className="px-4 py-3 font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{item.locationHu}</td>
                <td className="px-4 py-3 text-slate-600">{item.rating}</td>
                <td className="px-4 py-3">
                  {item.published ? t("published") : t("draft")}
                </td>
                <td className="px-4 py-3">
                  <TestimonialRowActions id={item.id} />
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {t("emptyTestimonials")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
