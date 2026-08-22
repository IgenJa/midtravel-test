import { describe, expect, it } from "vitest";
import { touristTripJsonLd } from "@/lib/json-ld-trip";
import { sampleTrip } from "../helpers/trip";

describe("touristTripJsonLd", () => {
  it("emits a TouristTrip with localized URL, itinerary and EUR offer", () => {
    const json = touristTripJsonLd(sampleTrip(), "hu");

    expect(json["@type"]).toBe("TouristTrip");
    expect(json.url).toMatch(/\/hu\/trips\/iceland$/);
    expect(json.image).toMatch(/\/trips\/iceland\.jpg$/);
    expect(json.itinerary).toMatchObject({
      "@type": "ItemList",
      numberOfItems: 2,
    });
    expect(json.offers).toMatchObject({
      "@type": "Offer",
      price: 1890,
      priceCurrency: "EUR",
    });
    expect(String(json.offers && (json.offers as { url: string }).url)).toContain(
      "/hu/apply?trip=iceland"
    );
  });

  it("keeps absolute hero images and prefixes relative ones without a leading slash", () => {
    const remote = touristTripJsonLd(
      sampleTrip({ heroImage: "https://cdn.example/hero.jpg" }),
      "en"
    );
    expect(remote.image).toBe("https://cdn.example/hero.jpg");
    expect(String(remote.url)).toMatch(/\/en\/trips\/iceland$/);

    const relative = touristTripJsonLd(
      sampleTrip({ heroImage: "trips/iceland.jpg" }),
      "en"
    );
    expect(String(relative.image)).toMatch(/\/trips\/iceland\.jpg$/);
  });
});
