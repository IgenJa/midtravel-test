import { describe, expect, it } from "vitest";
import { fillTileGrid, shuffleTiles, tripHeroTiles } from "@/lib/hero-tiles";
import type { Trip } from "@/types";

function trip(partial: Pick<Trip, "slug" | "title" | "heroImage" | "gallery">): Trip {
  return {
    id: partial.slug,
    country: "HU",
    price: 1,
    duration: 1,
    shortDescription: "",
    description: "",
    program: [],
    included: [],
    notIncluded: [],
    departureDates: [],
    meetingPoint: "",
    difficulty: "Easy",
    faq: [],
    ...partial,
  };
}

describe("hero tiles", () => {
  it("collects unique hero and gallery images per trip", () => {
    const tiles = tripHeroTiles([
      trip({
        slug: "rome",
        title: "Rome",
        heroImage: "/rome.jpg",
        gallery: ["/rome.jpg", "/colosseum.jpg"],
      }),
      trip({
        slug: "paris",
        title: "Paris",
        heroImage: "/paris.jpg",
        gallery: [],
      }),
    ]);

    expect(tiles).toEqual([
      { src: "/rome.jpg", slug: "rome", title: "Rome" },
      { src: "/colosseum.jpg", slug: "rome", title: "Rome" },
      { src: "/paris.jpg", slug: "paris", title: "Paris" },
    ]);
  });

  it("fills the grid by repeating shuffled tiles", () => {
    const source = [
      { src: "a.jpg", slug: "a", title: "A" },
      { src: "b.jpg", slug: "b", title: "B" },
    ];
    const filled = fillTileGrid(source, 5);
    expect(filled).toHaveLength(5);
    expect(filled.every((tile) => tile.slug === "a" || tile.slug === "b")).toBe(true);
  });

  it("returns a new shuffled array of the same items", () => {
    const source = [1, 2, 3, 4, 5];
    const shuffled = shuffleTiles(source);
    expect(shuffled).toHaveLength(source.length);
    expect([...shuffled].sort()).toEqual([...source].sort());
    expect(shuffled).not.toBe(source);
  });
});
