export type BillingAddress = {
  zip: string;
  city: string;
  street: string;
  country: string;
};

export function parseBillingAddress(
  raw: string | null | undefined
): BillingAddress | null {
  if (!raw?.trim()) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<BillingAddress>;
    if (
      typeof parsed.zip === "string" &&
      typeof parsed.city === "string" &&
      typeof parsed.street === "string"
    ) {
      return {
        zip: parsed.zip.trim(),
        city: parsed.city.trim(),
        street: parsed.street.trim(),
        country: (parsed.country ?? "HU").trim() || "HU",
      };
    }
  } catch {
    // Legacy free-text address — not structured enough for szamlazz.
  }

  return null;
}

export function serializeBillingAddress(address: BillingAddress): string {
  return JSON.stringify({
    zip: address.zip.trim(),
    city: address.city.trim(),
    street: address.street.trim(),
    country: (address.country.trim() || "HU").toUpperCase(),
  });
}

export function isCompleteBillingAddress(
  address: BillingAddress | null
): address is BillingAddress {
  return Boolean(
    address &&
      address.zip.length > 0 &&
      address.city.length > 0 &&
      address.street.length > 0
  );
}

export function formatBillingAddress(address: BillingAddress): string {
  const country =
    address.country.toUpperCase() === "HU" ? "Magyarország" : address.country;
  return `${address.zip} ${address.city}, ${address.street}, ${country}`;
}
