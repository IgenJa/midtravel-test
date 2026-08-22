"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  saveTrip,
  type TripSaveInput,
  type TripTranslationInput,
} from "@/app/actions/admin/trips";
import type { Difficulty } from "@/generated/prisma";
import type { TripDay, TripFaq } from "@/types";
import {
  DEFAULT_MAX_CAPACITY,
  DEFAULT_OVERBOOK_LIMIT,
  MAX_CAPACITY_MAX,
  OVERBOOK_LIMIT_MAX,
  type TripCapacitySnapshot,
} from "@/lib/trip-capacity";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const emptyTranslation = (): TripTranslationInput => ({
  title: "",
  country: "",
  meetingPoint: "",
  shortDescription: "",
  description: "",
  program: [{ day: 1, title: "", description: "" }],
  included: [""],
  notIncluded: [""],
  faq: [{ question: "", answer: "" }],
});

export type TripEditorInitial = {
  id?: string;
  slug: string;
  price: number;
  duration: number;
  heroImage: string;
  gallery: string[];
  difficulty: Difficulty;
  departureDates: string[];
  maxCapacity: number;
  overbookLimit: number;
  featured: boolean;
  published: boolean;
  hu: TripTranslationInput;
  en: TripTranslationInput;
};

type Props = {
  initial?: TripEditorInitial;
  occupancy?: TripCapacitySnapshot | null;
};

function linesToText(values: string[]) {
  return values.join("\n");
}

function textToLines(value: string) {
  return value.split("\n");
}

function TranslationEditor({
  localeLabel,
  value,
  onChange,
}: {
  localeLabel: string;
  value: TripTranslationInput;
  onChange: (next: TripTranslationInput) => void;
}) {
  const t = useTranslations("admin");

  const updateProgram = (index: number, patch: Partial<TripDay>) => {
    const program = value.program.map((day, i) =>
      i === index ? { ...day, ...patch } : day
    );
    onChange({ ...value, program });
  };

  const updateFaq = (index: number, patch: Partial<TripFaq>) => {
    const faq = value.faq.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    onChange({ ...value, faq });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-display text-xl font-bold text-slate-900">
        {localeLabel}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{t("fieldTitle")}</label>
          <input
            className={inputClasses}
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("fieldCountry")}
          </label>
          <input
            className={inputClasses}
            value={value.country}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("fieldMeetingPoint")}
        </label>
        <input
          className={inputClasses}
          value={value.meetingPoint}
          onChange={(e) =>
            onChange({ ...value, meetingPoint: e.target.value })
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("fieldShortDescription")}
        </label>
        <textarea
          className={inputClasses}
          rows={2}
          value={value.shortDescription}
          onChange={(e) =>
            onChange({ ...value, shortDescription: e.target.value })
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("fieldDescription")}
        </label>
        <textarea
          className={inputClasses}
          rows={5}
          value={value.description}
          onChange={(e) =>
            onChange({ ...value, description: e.target.value })
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("fieldIncluded")}
        </label>
        <textarea
          className={inputClasses}
          rows={4}
          value={linesToText(value.included)}
          onChange={(e) =>
            onChange({ ...value, included: textToLines(e.target.value) })
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("fieldNotIncluded")}
        </label>
        <textarea
          className={inputClasses}
          rows={4}
          value={linesToText(value.notIncluded)}
          onChange={(e) =>
            onChange({ ...value, notIncluded: textToLines(e.target.value) })
          }
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800">{t("fieldProgram")}</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...value,
                program: [
                  ...value.program,
                  {
                    day: value.program.length + 1,
                    title: "",
                    description: "",
                  },
                ],
              })
            }
          >
            {t("addDay")}
          </Button>
        </div>
        {value.program.map((day, index) => (
          <div
            key={`day-${index}`}
            className="grid gap-2 rounded-xl border border-slate-100 p-3"
          >
            <input
              className={inputClasses}
              placeholder={t("dayTitle")}
              value={day.title}
              onChange={(e) => updateProgram(index, { title: e.target.value })}
            />
            <textarea
              className={inputClasses}
              rows={2}
              placeholder={t("dayDescription")}
              value={day.description}
              onChange={(e) =>
                updateProgram(index, { description: e.target.value })
              }
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800">{t("fieldFaq")}</h4>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...value,
                faq: [...value.faq, { question: "", answer: "" }],
              })
            }
          >
            {t("addFaq")}
          </Button>
        </div>
        {value.faq.map((item, index) => (
          <div
            key={`faq-${index}`}
            className="grid gap-2 rounded-xl border border-slate-100 p-3"
          >
            <input
              className={inputClasses}
              placeholder={t("faqQuestion")}
              value={item.question}
              onChange={(e) => updateFaq(index, { question: e.target.value })}
            />
            <textarea
              className={inputClasses}
              rows={2}
              placeholder={t("faqAnswer")}
              value={item.answer}
              onChange={(e) => updateFaq(index, { answer: e.target.value })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TripEditorForm({ initial, occupancy }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TripEditorInitial>(
    initial ?? {
      slug: "",
      price: 1000,
      duration: 7,
      heroImage: "",
      gallery: [],
      difficulty: "Moderate",
      departureDates: [],
      maxCapacity: DEFAULT_MAX_CAPACITY,
      overbookLimit: DEFAULT_OVERBOOK_LIMIT,
      featured: false,
      published: true,
      hu: emptyTranslation(),
      en: emptyTranslation(),
    }
  );

  const galleryText = useMemo(
    () => form.gallery.join("\n"),
    [form.gallery]
  );
  const datesText = useMemo(
    () => form.departureDates.join("\n"),
    [form.departureDates]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: TripSaveInput = {
      id: form.id,
      slug: form.slug,
      price: form.price,
      duration: form.duration,
      heroImage: form.heroImage,
      gallery: form.gallery,
      difficulty: form.difficulty,
      departureDates: form.departureDates,
      maxCapacity: form.maxCapacity,
      overbookLimit: form.overbookLimit,
      featured: form.featured,
      published: form.published,
      hu: form.hu,
      en: form.en,
    };

    const result = await saveTrip(payload);
    setSaving(false);

    if (!result.ok) {
      setError(t(`errors.${result.code}`));
      return;
    }

    router.push("/admin/trips");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-display text-xl font-bold text-slate-900">
          {t("sharedFields")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("fieldSlug")}</label>
            <input
              className={inputClasses}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("fieldDifficulty")}
            </label>
            <select
              className={inputClasses}
              value={form.difficulty}
              onChange={(e) =>
                setForm({
                  ...form,
                  difficulty: e.target.value as Difficulty,
                })
              }
            >
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Challenging">Challenging</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t("fieldPrice")}</label>
            <input
              type="number"
              min={0}
              className={inputClasses}
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("fieldDuration")}
            </label>
            <input
              type="number"
              min={1}
              className={inputClasses}
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: Number(e.target.value) })
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("fieldMaxCapacity")}
            </label>
            <input
              type="number"
              min={1}
              max={MAX_CAPACITY_MAX}
              className={inputClasses}
              value={form.maxCapacity}
              onChange={(e) =>
                setForm({ ...form, maxCapacity: Number(e.target.value) })
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("fieldOverbookLimit")}
            </label>
            <input
              type="number"
              min={0}
              max={OVERBOOK_LIMIT_MAX}
              className={inputClasses}
              value={form.overbookLimit}
              onChange={(e) =>
                setForm({ ...form, overbookLimit: Number(e.target.value) })
              }
              required
            />
            <p className="mt-1 text-xs text-slate-500">{t("overbookHint")}</p>
          </div>
        </div>

        {occupancy ? (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              occupancy.isFull
                ? "bg-red-50 text-red-800"
                : occupancy.isOverbooked
                  ? "bg-amber-50 text-amber-800"
                  : "bg-slate-50 text-slate-700"
            }`}
          >
            {t("occupancySummary", {
              occupied: occupancy.occupiedSeats,
              capacity: occupancy.maxCapacity,
              allowed: occupancy.allowedSeats,
              remaining: occupancy.remainingSeats,
            })}
          </p>
        ) : null}

        <ImageUploadField
          label={t("fieldHeroImage")}
          value={form.heroImage}
          folder="trips"
          onChange={(url) => setForm({ ...form, heroImage: url })}
        />

        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("fieldGallery")}
          </label>
          <textarea
            className={inputClasses}
            rows={4}
            value={galleryText}
            onChange={(e) =>
              setForm({
                ...form,
                gallery: e.target.value.split("\n").map((line) => line.trim()),
              })
            }
          />
          <p className="mt-1 text-xs text-slate-500">{t("galleryHint")}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("fieldDepartureDates")}
          </label>
          <textarea
            className={inputClasses}
            rows={3}
            value={datesText}
            onChange={(e) =>
              setForm({
                ...form,
                departureDates: e.target.value
                  .split("\n")
                  .map((line) => line.trim()),
              })
            }
            placeholder="2026-05-15"
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({ ...form, featured: e.target.checked })
              }
            />
            {t("fieldFeatured")}
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            {t("fieldPublished")}
          </label>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <TranslationEditor
          localeLabel={t("localeHu")}
          value={form.hu}
          onChange={(hu) => setForm({ ...form, hu })}
        />
        <TranslationEditor
          localeLabel={t("localeEn")}
          value={form.en}
          onChange={(en) => setForm({ ...form, en })}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
        <Button href="/admin/trips" variant="outline" type="button">
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
