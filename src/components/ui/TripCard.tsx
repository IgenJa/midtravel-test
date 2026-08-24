"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import type { Trip } from "@/types";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  featured?: boolean;
  compact?: boolean;
}

export function TripCard({ trip, featured = false, compact = false }: TripCardProps) {
  const t = useTranslations("common");

  return (
    <Link href={`/trips/${trip.slug}`} className="group block h-full">
      <Card padding="none" className="flex h-full flex-col overflow-hidden">
        <div
          className={cn(
            "relative overflow-hidden",
            compact ? "aspect-[4/5] sm:aspect-[4/3]" : "aspect-[4/5] sm:aspect-[4/3]"
          )}
        >
          <Image
            src={trip.heroImage}
            alt={trip.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {(featured || trip.featured) && (
            <span className="absolute left-2 top-2 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs">
              {t("featured")}
            </span>
          )}
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
            <p className="text-[11px] font-medium text-teal-300 sm:text-sm">{trip.country}</p>
            <h3 className="font-display text-sm font-bold leading-tight text-white sm:text-xl">
              {trip.title}
            </h3>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-6">
          <p className="hidden line-clamp-2 text-sm leading-relaxed text-slate-600 sm:block">
            {trip.shortDescription}
          </p>
          <div className={cn("flex items-center gap-2 text-xs text-slate-500 sm:gap-4 sm:text-sm", "mt-0 sm:mt-4")}>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {trip.duration} {t("days")}
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <MapPin className="h-4 w-4" />
              {trip.country}
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2 sm:pt-4">
            <div>
              <p className="text-[10px] text-slate-500 sm:text-xs">{t("from")}</p>
              <p className="text-sm font-bold text-teal-700 sm:text-lg">
                {formatPrice(trip.price)}
              </p>
            </div>
            <motion.span
              className="flex items-center gap-0.5 text-xs font-semibold text-teal-600 sm:gap-1 sm:text-sm"
              whileHover={{ x: 4 }}
            >
              <span className="hidden sm:inline">{t("viewTrip")}</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
