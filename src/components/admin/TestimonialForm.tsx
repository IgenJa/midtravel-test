"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  saveTestimonial,
  type TestimonialSaveInput,
} from "@/app/actions/admin/testimonials";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

type Props = {
  initial?: TestimonialSaveInput;
};

export function TestimonialForm({ initial }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialSaveInput>(
    initial ?? {
      name: "",
      locationHu: "",
      locationEn: "",
      textHu: "",
      textEn: "",
      rating: 5,
      avatar: "",
      sortOrder: 0,
      published: true,
    }
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveTestimonial(form);
    setSaving(false);

    if (!result.ok) {
      setError(t(`errors.${result.code}`));
      return;
    }

    router.push("/admin/testimonials");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{t("fieldName")}</label>
          <input
            className={inputClasses}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t("fieldRating")}</label>
          <input
            type="number"
            min={1}
            max={5}
            className={inputClasses}
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: Number(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("fieldLocationHu")}
          </label>
          <input
            className={inputClasses}
            value={form.locationHu}
            onChange={(e) => setForm({ ...form, locationHu: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("fieldLocationEn")}
          </label>
          <input
            className={inputClasses}
            value={form.locationEn}
            onChange={(e) => setForm({ ...form, locationEn: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t("fieldSortOrder")}</label>
          <input
            type="number"
            className={inputClasses}
            value={form.sortOrder}
            onChange={(e) =>
              setForm({ ...form, sortOrder: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("fieldTextHu")}</label>
        <textarea
          className={inputClasses}
          rows={4}
          value={form.textHu}
          onChange={(e) => setForm({ ...form, textHu: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t("fieldTextEn")}</label>
        <textarea
          className={inputClasses}
          rows={4}
          value={form.textEn}
          onChange={(e) => setForm({ ...form, textEn: e.target.value })}
          required
        />
      </div>

      <ImageUploadField
        label={t("fieldAvatar")}
        value={form.avatar}
        folder="testimonials"
        onChange={(url) => setForm({ ...form, avatar: url })}
      />

      <label className="inline-flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        {t("fieldPublished")}
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
        <Button href="/admin/testimonials" variant="outline" type="button">
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
