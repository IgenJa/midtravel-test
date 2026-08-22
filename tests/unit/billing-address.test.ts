import { describe, expect, it } from "vitest";
import {
  formatBillingAddress,
  isCompleteBillingAddress,
  parseBillingAddress,
  serializeBillingAddress,
} from "@/lib/billing-address";

const complete = {
  zip: "6727",
  city: "Szeged",
  street: "Délceg utca 11.",
  country: "HU",
};

describe("parseBillingAddress", () => {
  it("returns null for empty, invalid JSON, or free-text legacy rows", () => {
    expect(parseBillingAddress(null)).toBeNull();
    expect(parseBillingAddress("")).toBeNull();
    expect(parseBillingAddress("  ")).toBeNull();
    expect(parseBillingAddress("not-json")).toBeNull();
    expect(parseBillingAddress("Szeged, Délceg utca 11.")).toBeNull();
  });

  it("parses structured JSON and defaults country to HU", () => {
    expect(
      parseBillingAddress(
        JSON.stringify({ zip: " 6727 ", city: "Szeged", street: "Délceg utca 11." })
      )
    ).toEqual(complete);

    expect(
      parseBillingAddress(
        JSON.stringify({
          zip: "1010",
          city: "Wien",
          street: "Stephansplatz 1",
          country: "AT",
        })
      )
    ).toMatchObject({ country: "AT" });
  });
});

describe("serialize / complete / format", () => {
  it("round-trips a complete address and uppercases country", () => {
    const raw = serializeBillingAddress({
      zip: " 1010 ",
      city: " Wien ",
      street: " Stephansplatz 1 ",
      country: "at",
    });
    expect(JSON.parse(raw)).toEqual({
      zip: "1010",
      city: "Wien",
      street: "Stephansplatz 1",
      country: "AT",
    });
    expect(isCompleteBillingAddress(parseBillingAddress(raw))).toBe(true);
  });

  it("treats missing street/city/zip as incomplete", () => {
    expect(isCompleteBillingAddress(null)).toBe(false);
    expect(
      isCompleteBillingAddress({ zip: "", city: "Szeged", street: "X", country: "HU" })
    ).toBe(false);
  });

  it("formats HU as Magyarország and leaves other countries as-is", () => {
    expect(formatBillingAddress(complete)).toBe(
      "6727 Szeged, Délceg utca 11., Magyarország"
    );
    expect(
      formatBillingAddress({ ...complete, country: "AT", zip: "1010", city: "Wien" })
    ).toBe("1010 Wien, Délceg utca 11., AT");
  });
});
