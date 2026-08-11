"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  saveTeamMember,
  type TeamMemberSaveInput,
} from "@/app/actions/admin/team";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

type Props = {
  initial?: TeamMemberSaveInput;
};

export function TeamMemberForm({ initial }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TeamMemberSaveInput>(
    initial ?? {
      name: "",
      positionHu: "",
      positionEn: "",
      descriptionHu: "",
      descriptionEn: "",
      photo: "/profile-placeholder.svg",
      linkedin: "",
      instagram: "",
      email: "",
      sortOrder: 0,
      published: true,
    }
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const result = await saveTeamMember(form);
    setSaving(false);

    if (!result.ok) {
      setError(t(`errors.${result.code}`));
      return;
    }

    router.push("/admin/team");
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
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("fieldPositionHu")}
          </label>
          <input
            className={inputClasses}
            value={form.positionHu}
            onChange={(e) => setForm({ ...form, positionHu: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("fieldPositionEn")}
          </label>
          <input
            className={inputClasses}
            value={form.positionEn}
            onChange={(e) => setForm({ ...form, positionEn: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("fieldDescriptionHu")}
        </label>
        <textarea
          className={inputClasses}
          rows={4}
          value={form.descriptionHu}
          onChange={(e) => setForm({ ...form, descriptionHu: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("fieldDescriptionEn")}
        </label>
        <textarea
          className={inputClasses}
          rows={4}
          value={form.descriptionEn}
          onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          required
        />
      </div>

      <ImageUploadField
        label={t("fieldPhoto")}
        value={form.photo}
        folder="team"
        onChange={(url) => setForm({ ...form, photo: url })}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">LinkedIn</label>
          <input
            className={inputClasses}
            value={form.linkedin ?? ""}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Instagram</label>
          <input
            className={inputClasses}
            value={form.instagram ?? ""}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            className={inputClasses}
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

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
        <Button href="/admin/team" variant="outline" type="button">
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
