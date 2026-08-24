"use client";

import { HexagonHero } from "@/components/ui/HexagonHero";
import { useAuth } from "@/contexts/AuthContext";
import type { HeroTile } from "@/lib/hero-tiles";

interface HomeHeroProps {
  title: string;
  subtitle: string;
  tiles: HeroTile[];
  exploreLabel: string;
  signUpLabel: string;
}

export function HomeHero({
  title,
  subtitle,
  tiles,
  exploreLabel,
  signUpLabel,
}: HomeHeroProps) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <HexagonHero
      title={title}
      subtitle={subtitle}
      tiles={tiles}
      exploreLabel={exploreLabel}
      signUpLabel={!isLoading && !isAuthenticated ? signUpLabel : undefined}
    />
  );
}
