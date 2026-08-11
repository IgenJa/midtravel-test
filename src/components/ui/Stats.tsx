"use client";

import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";

interface Stat {
  value: string;
  label: string;
}

interface StatsProps {
  stats: Stat[];
}

export function Stats({ stats }: StatsProps) {
  return (
    <StaggerContainer className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {stats.map((stat) => (
        <StaggerItem key={stat.label}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm"
          >
            <p className="font-display text-3xl font-bold text-white sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-teal-100">{stat.label}</p>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
