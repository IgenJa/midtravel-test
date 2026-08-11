import Stripe from "stripe";

export const BOOKING_CURRENCY = "eur";

/** Currencies where Stripe amounts are in major units (no cents). */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
  "huf",
]);

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getDepositPercent(): number {
  const raw = Number(process.env.STRIPE_DEPOSIT_PERCENT ?? "30");
  if (!Number.isFinite(raw) || raw <= 0 || raw > 100) return 30;
  return Math.round(raw);
}

export function calcDepositAmount(
  totalAmount: number,
  percent = getDepositPercent()
): number {
  return Math.max(1, Math.round((totalAmount * percent) / 100));
}

export function toStripeUnitAmount(
  amountMajor: number,
  currency = BOOKING_CURRENCY
): number {
  const code = currency.toLowerCase();
  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return Math.round(amountMajor);
  }
  return Math.round(amountMajor * 100);
}

let stripeClient: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (stripeClient === undefined) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function requireStripe(): Stripe {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  return stripe;
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
