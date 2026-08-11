"use client";

import { useSearchParams } from "next/navigation";
import { TripApplicationForm } from "@/components/ui/TripApplicationForm";

type Props = {
  trips: {
    slug: string;
    title: string;
    country: string;
    duration: number;
    price: number;
  }[];
  depositPercent: number;
  stripeEnabled: boolean;
};

export function TripApplicationFormClient({
  trips,
  depositPercent,
  stripeEnabled,
}: Props) {
  const searchParams = useSearchParams();
  const tripSlug = searchParams.get("trip") ?? undefined;

  return (
    <TripApplicationForm
      defaultTripSlug={tripSlug}
      trips={trips}
      depositPercent={depositPercent}
      stripeEnabled={stripeEnabled}
    />
  );
}
