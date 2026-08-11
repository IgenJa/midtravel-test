import { getTripOptions } from "@/data/trips";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getDepositPercent, isStripeConfigured } from "@/lib/stripe";
import { TripApplicationFormClient } from "./TripApplicationFormClient";

export async function TripApplicationFormWrapper() {
  const locale = (await getLocale()) as Locale;
  const trips = await getTripOptions(locale);

  return (
    <TripApplicationFormClient
      trips={trips}
      depositPercent={getDepositPercent()}
      stripeEnabled={isStripeConfigured()}
    />
  );
}
