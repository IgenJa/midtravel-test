"use client";

import { useEffect, useMemo, useRef, type Ref } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { HERO_TILE_COLS, HERO_TILE_ROWS, type HeroTile } from "@/lib/hero-tiles";
import { cn } from "@/lib/utils";

const SLIDE_SPEED = 32;

function useSeamlessSlide(enabled: boolean) {
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const set = setRef.current;
    if (!enabled || !track || !set) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let offset = 0;
    let frame = 0;
    let last = performance.now();
    let width = set.getBoundingClientRect().width;

    const measure = () => {
      width = set.getBoundingClientRect().width;
    };

    const observer = new ResizeObserver(measure);
    observer.observe(set);

    const tick = (now: number) => {
      const dt = Math.min(now - last, 32);
      last = now;
      const paused = track.matches(":has(.hex-cell:hover)");
      if (!paused && width > 0) {
        offset = (offset + (SLIDE_SPEED * dt) / 1000) % width;
        track.style.transform = `translate3d(${-Math.round(offset)}px, 0, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled]);

  return { trackRef, setRef };
}

interface HexagonHeroProps {
  title: string;
  subtitle: string;
  tiles: HeroTile[];
  exploreLabel: string;
  signUpLabel?: string;
}

function splitRows(tiles: HeroTile[]): HeroTile[][] {
  const rows: HeroTile[][] = Array.from({ length: HERO_TILE_ROWS }, () => []);
  tiles.forEach((tile, index) => {
    rows[index % HERO_TILE_ROWS]?.push(tile);
  });

  const cols = Math.max(...rows.map((row) => row.length), HERO_TILE_COLS);
  return rows.map((row) => {
    const padded = [...row];
    let i = 0;
    while (padded.length < cols && tiles.length > 0) {
      const extra = tiles[i % tiles.length];
      if (extra) padded.push(extra);
      i += 1;
    }
    return padded;
  });
}

function HexTile({
  tile,
  priority,
}: {
  tile: HeroTile;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/trips/${tile.slug}`}
      aria-label={tile.title}
      className="hex-cell relative z-0 block"
    >
      <span className="hex-frame">
        <span className="hex-photo">
          <Image
            src={tile.src}
            alt=""
            fill
            sizes="220px"
            priority={priority}
            className="hex-image object-cover object-center"
          />
        </span>
        <span className="hex-label">{tile.title}</span>
      </span>
    </Link>
  );
}

function HexGrid({
  rows,
  hidden,
  setRef,
}: {
  rows: HeroTile[][];
  hidden?: boolean;
  setRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div className="hex-set" aria-hidden={hidden || undefined} ref={setRef}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={cn("hex-row", rowIndex % 2 === 1 && "hex-row-offset")}
        >
          {row.map((tile, tileIndex) => (
            <HexTile
              key={`${hidden ? "copy" : "src"}-${rowIndex}-${tileIndex}-${tile.slug}-${tile.src}`}
              tile={tile}
              priority={!hidden && rowIndex < 2 && tileIndex < 4}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function HexagonHero({
  title,
  subtitle,
  tiles,
  exploreLabel,
  signUpLabel,
}: HexagonHeroProps) {
  const rows = useMemo(() => splitRows(tiles), [tiles]);
  const hasTiles = Boolean(rows[0]?.length);
  const { trackRef, setRef } = useSeamlessSlide(hasTiles);

  return (
    <section className="hex-hero relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-cream sm:min-h-[90vh]">
      {hasTiles ? (
        <div
          className="hex-slider pointer-events-none absolute inset-0"
          style={{ ["--hex-cols" as string]: String(rows[0]?.length ?? HERO_TILE_COLS) }}
        >
          <div ref={trackRef} className="hex-track pointer-events-auto">
            <HexGrid rows={rows} setRef={setRef} />
            <HexGrid rows={rows} hidden />
          </div>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 18, opacity: 0.92 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl rounded-3xl bg-[#fffdf8]/88 px-6 py-8 shadow-[0_28px_80px_rgb(58_63_102_/_0.2)] ring-1 ring-[#c8b87a]/45 backdrop-blur-xl sm:px-12 sm:py-12"
        >
          <h1 className="font-display text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <GoldRule className="mt-6" />
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/trips" size="lg">
              {exploreLabel}
            </Button>
            {signUpLabel ? (
              <Button href="/register" variant="outline" size="lg">
                {signUpLabel}
              </Button>
            ) : null}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <ArrowDown className="h-6 w-6 animate-bounce text-navy/50" />
      </div>
    </section>
  );
}
