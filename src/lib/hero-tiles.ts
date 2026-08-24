import type { Trip } from "@/types";

export type HeroTile = {
  src: string;
  slug: string;
  title: string;
};

export function tripHeroTiles(trips: Trip[]): HeroTile[] {
  const tiles: HeroTile[] = [];
  const seen = new Set<string>();

  for (const trip of trips) {
    const images = [trip.heroImage, ...trip.gallery];
    for (const src of images) {
      const key = `${trip.slug}:${src}`;
      if (!src || seen.has(key)) continue;
      seen.add(key);
      tiles.push({ src, slug: trip.slug, title: trip.title });
    }
  }

  return tiles;
}

export function shuffleTiles<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) continue;
    next[i] = swap;
    next[j] = current;
  }
  return next;
}

export const HERO_TILE_ROWS = 4;
export const HERO_TILE_COLS = 10;
export const HERO_TILE_MIN = HERO_TILE_ROWS * HERO_TILE_COLS;

export function fillTileGrid(tiles: HeroTile[], minCount: number): HeroTile[] {
  if (tiles.length === 0) return [];

  const filled: HeroTile[] = [];
  while (filled.length < minCount) {
    filled.push(...shuffleTiles(tiles));
  }
  return filled.slice(0, Math.max(minCount, tiles.length));
}
