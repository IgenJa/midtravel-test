"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { TripCard } from "@/components/ui/TripCard";
import { TripFilters } from "@/components/ui/TripFilters";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  createDefaultTripFilters,
  filterTrips,
  getPriceBounds,
  hasActiveFilters,
} from "@/lib/trip-filters";
import type { Trip } from "@/types";

interface TripsPageContentProps {
  trips: Trip[];
}

export function TripsPageContent({ trips }: TripsPageContentProps) {
  const t = useTranslations("trips");
  const priceBounds = getPriceBounds(trips);
  const [filters, setFilters] = useState(() => createDefaultTripFilters(trips));

  const filteredTrips = useMemo(
    () => filterTrips(trips, filters),
    [trips, filters]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={t("eyebrow", { count: trips.length })}
        title={t("title")}
        description={t("description")}
      />

      <div className="mt-10">
        <TripFilters trips={trips} filters={filters} onChange={setFilters} />
      </div>

      <p className="mt-6 text-sm font-medium text-slate-600">
        {t("resultsCount", { count: filteredTrips.length, total: trips.length })}
      </p>

      <AnimatePresence mode="popLayout">
        {filteredTrips.length > 0 ? (
          <motion.div
            key="results"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredTrips.map((trip) => (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <TripCard trip={trip} featured={trip.featured} compact />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center"
          >
            <p className="font-display text-xl font-bold text-slate-900">
              {t("noResultsTitle")}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {t("noResultsDescription")}
            </p>
            {hasActiveFilters(filters, priceBounds) && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setFilters(createDefaultTripFilters(trips))}
              >
                {t("filter.clear")}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
