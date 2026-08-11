"use client";

import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import type { PriceBounds } from "@/lib/trip-filters";
import { cn } from "@/lib/utils";

interface PriceRangeSliderProps {
  bounds: PriceBounds;
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  active: boolean;
}

const STEP = 10;

export function PriceRangeSlider({
  bounds,
  min,
  max,
  onChange,
  active,
}: PriceRangeSliderProps) {
  const t = useTranslations("trips.filter");

  const handleMinChange = (value: number) => {
    onChange(Math.min(value, max - STEP), max);
  };

  const handleMaxChange = (value: number) => {
    onChange(min, Math.max(value, min + STEP));
  };

  const minPercent = ((min - bounds.min) / (bounds.max - bounds.min)) * 100;
  const maxPercent = ((max - bounds.min) / (bounds.max - bounds.min)) * 100;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        active
          ? "border-teal-300 bg-teal-50/50"
          : "border-slate-200 bg-slate-50/80"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("customRange")}
        </p>
        <p className="text-sm font-semibold text-teal-700">
          {formatPrice(min)} – {formatPrice(max)}
        </p>
      </div>

      <div className="relative mt-6 h-2">
        <div className="absolute inset-0 rounded-full bg-slate-200" />
        <div
          className="absolute h-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={min}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          aria-label={t("minPrice")}
          className="price-range-thumb absolute inset-0 z-20 h-2 w-full cursor-pointer appearance-none bg-transparent"
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={max}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          aria-label={t("maxPrice")}
          className="price-range-thumb absolute inset-0 z-30 h-2 w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{formatPrice(bounds.min)}</span>
        <span>{formatPrice(bounds.max)}</span>
      </div>
    </div>
  );
}
