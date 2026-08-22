import { describe, expect, it } from "vitest";
import { createMetadata } from "@/lib/seo";

describe("createMetadata", () => {
  it("builds a localized canonical and hreflang pair", () => {
    const meta = createMetadata({
      title: "Izland",
      description: "Egy hét Izlandon",
      path: "/trips/iceland",
      locale: "hu",
    });

    expect(meta.title).toBe("Izland | MidTravel");
    expect(meta.alternates?.canonical).toMatch(/\/hu\/trips\/iceland$/);
    expect(meta.alternates?.languages).toMatchObject({
      hu: expect.stringMatching(/\/hu\/trips\/iceland$/),
      en: expect.stringMatching(/\/en\/trips\/iceland$/),
    });
  });

  it("uses the site tagline on the homepage", () => {
    const meta = createMetadata({
      title: "Home",
      description: "Welcome",
      locale: "en",
      siteTagline: "Premium travel",
    });

    expect(meta.title).toBe("MidTravel | Premium travel");
    expect(meta.alternates?.canonical).toMatch(/\/en$/);
  });
});
