"use client";

import { useTranslations, useLocale } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { getDifficultyLabel } from "@/lib/locale";
import { PriceRangeSlider } from "@/components/ui/PriceRangeSlider";
import {
  createDefaultTripFilters,
  getPriceBounds,
  getUniqueCountries,
  getUniqueDurations,
  hasActiveFilters,
  PRICE_PRESETS,
  type PriceRange,
  type TripFilters as TripFiltersState,
} from "@/lib/trip-filters";
import type { Trip } from "@/types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface TripFiltersProps {
  trips: Trip[];
  filters: TripFiltersState;
  onChange: (filters: TripFiltersState) => void;
}

const difficulties = ["Easy", "Moderate", "Challenging"] as const;

const presetLabelKeys: Record<
  Exclude<PriceRange, "all" | "custom">,
  string
> = {
  under1000: "priceUnder1000",
  "1000_1299": "price1000_1299",
  "1300_1599": "price1300_1599",
  "1600_1899": "price1600_1899",
  "1900_2199": "price1900_2199",
  "2200_plus": "price2200Plus",
};

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const presetButtonClass = (selected: boolean) =>
  cn(
    "rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all sm:text-sm",
    selected
      ? "border-teal-500 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20"
      : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50/50"
  );

export function TripFilters({ trips, filters, onChange }: TripFiltersProps) {
  const t = useTranslations("trips.filter");
  const locale = useLocale() as Locale;

  const countries = getUniqueCountries(trips);
  const durations = getUniqueDurations(trips);
  const priceBounds = getPriceBounds(trips);
  const active = hasActiveFilters(filters, priceBounds);

  const update = (patch: Partial<TripFiltersState>) => {
    onChange({ ...filters, ...patch });
  };

  const selectPreset = (value: PriceRange) => {
    if (value === "all") {
      update({
        priceRange: "all",
        priceMin: priceBounds.min,
        priceMax: priceBounds.max,
      });
      return;
    }

    const preset = PRICE_PRESETS.find((item) => item.value === value);
    if (!preset) return;

    update({
      priceRange: value,
      priceMin: preset.min === 0 ? priceBounds.min : preset.min,
      priceMax: preset.max === Infinity ? priceBounds.max : preset.max,
    });
  };

  const handleCustomRange = (min: number, max: number) => {
    update({
      priceRange: "custom",
      priceMin: min,
      priceMax: max,
    });
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200/60 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900">
          <SlidersHorizontal className="h-5 w-5 text-teal-600" />
          <h3 className="font-display text-lg font-bold">{t("title")}</h3>
        </div>
        {active && (
          <button
            type="button"
            onClick={() => onChange(createDefaultTripFilters(trips))}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50"
          >
            <X className="h-4 w-4" />
            {t("clear")}
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("difficulty")}
          </span>
          <select
            value={filters.difficulty}
            onChange={(e) =>
              update({
                difficulty: e.target.value as TripFiltersState["difficulty"],
              })
            }
            className={selectClass}
          >
            <option value="all">{t("all")}</option>
            {difficulties.map((level) => (
              <option key={level} value={level}>
                {getDifficultyLabel(level, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("location")}
          </span>
          <select
            value={filters.country}
            onChange={(e) => update({ country: e.target.value })}
            className={selectClass}
          >
            <option value="all">{t("all")}</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("duration")}
          </span>
          <select
            value={filters.duration}
            onChange={(e) =>
              update({
                duration:
                  e.target.value === "all"
                    ? "all"
                    : Number(e.target.value),
              })
            }
            className={selectClass}
          >
            <option value="all">{t("all")}</option>
            {durations.map((days) => (
              <option key={days} value={days}>
                {t("daysOption", { count: days })}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("price")}
        </span>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => selectPreset("all")}
            className={presetButtonClass(filters.priceRange === "all")}
          >
            {t("all")}
          </button>
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => selectPreset(preset.value)}
              className={presetButtonClass(filters.priceRange === preset.value)}
            >
              {t(presetLabelKeys[preset.value])}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <PriceRangeSlider
            bounds={priceBounds}
            min={filters.priceMin}
            max={filters.priceMax}
            active={filters.priceRange === "custom"}
            onChange={handleCustomRange}
          />
        </div>
      </div>

      <p
        className={cn(
          "mt-4 text-sm",
          active ? "text-teal-700" : "text-slate-500"
        )}
      >
        {active ? t("activeHint") : t("hint")}
      </p>
    </div>
  );
}
