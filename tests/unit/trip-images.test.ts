import { describe, expect, it } from "vitest";
import {
  isBrokenTripImage,
  resolveTripImage,
  TRIP_IMAGE_PLACEHOLDER,
  withTripImageFallback,
} from "@/lib/trip-images";
import { sampleTrip } from "../helpers/trip";

describe("resolveTripImage", () => {
  it("keeps healthy URLs and swaps known broken Unsplash IDs", () => {
    expect(resolveTripImage("/trips/iceland.jpg")).toBe("/trips/iceland.jpg");
    expect(
      isBrokenTripImage(
        "https://images.unsplash.com/photo-1613395877344-13d4a8e0d325?w=800"
      )
    ).toBe(true);
    expect(
      resolveTripImage(
        "https://images.unsplash.com/photo-1613395877344-13d4a8e0d325?w=800"
      )
    ).toBe(TRIP_IMAGE_PLACEHOLDER);
  });
});

describe("withTripImageFallback", () => {
  it("rewrites hero and gallery, and inserts a placeholder when gallery is empty", () => {
    const broken =
      "https://images.unsplash.com/photo-1504829857797-ddb29a287b8f";

    expect(
      withTripImageFallback(
        sampleTrip({ heroImage: broken, gallery: [broken, "/ok.jpg"] })
      )
    ).toMatchObject({
      heroImage: TRIP_IMAGE_PLACEHOLDER,
      gallery: [TRIP_IMAGE_PLACEHOLDER, "/ok.jpg"],
    });

    expect(withTripImageFallback(sampleTrip({ gallery: [] })).gallery).toEqual([
      TRIP_IMAGE_PLACEHOLDER,
    ]);
  });
});
