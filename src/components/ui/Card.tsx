"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  none: "",
};

export function Card({
  children,
  className,
  hover = true,
  padding = "md",
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "group overflow-hidden rounded-2xl bg-[#fffdf8] shadow-md ring-1 ring-teal-200/50",
        hover &&
          "transition-shadow duration-300 hover:shadow-[0_18px_40px_rgb(58_63_102_/_0.14)] hover:ring-teal-300/80",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
