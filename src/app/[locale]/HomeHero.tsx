"use client";

import { Hero } from "@/components/ui/Hero";
import { useAuth } from "@/contexts/AuthContext";

interface HomeHeroProps {
  title: string;
  subtitle: string;
  image: string;
  exploreLabel: string;
  signUpLabel: string;
}

export function HomeHero({
  title,
  subtitle,
  image,
  exploreLabel,
  signUpLabel,
}: HomeHeroProps) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Hero
      title={title}
      subtitle={subtitle}
      image={image}
      ctaPrimary={{ label: exploreLabel, href: "/trips" }}
      ctaSecondary={
        !isLoading && !isAuthenticated
          ? { label: signUpLabel, href: "/register" }
          : undefined
      }
    />
  );
}
