"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  overlay?: boolean;
  compact?: boolean;
}

export function Hero({
  title,
  subtitle,
  image,
  ctaPrimary,
  ctaSecondary,
  overlay = true,
  compact = false,
}: HeroProps) {
  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden ${
        compact ? "min-h-[40vh] sm:min-h-[50vh]" : "min-h-[85vh] sm:min-h-[90vh]"
      }`}
    >
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/70" />
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">
            {subtitle}
          </p>
          {(ctaPrimary || ctaSecondary) && (
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {ctaPrimary && (
                <Button href={ctaPrimary.href} size="lg">
                  {ctaPrimary.label}
                </Button>
              )}
              {ctaSecondary && (
                <Button href={ctaSecondary.href} variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  {ctaSecondary.label}
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {!compact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ArrowDown className="h-6 w-6 text-white/60" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
