import { type ReactNode } from "react";
import { GoldRule } from "@/components/ui/GoldRule";

interface CtaBannerProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function CtaBanner({ title, description, children }: CtaBannerProps) {
  return (
    <div className="cta-banner relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
      <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
        {title}
      </h2>
      <GoldRule className="relative mt-5" light />
      <p className="relative mx-auto mt-5 max-w-xl text-teal-100/90">
        {description}
      </p>
      <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {children}
      </div>
    </div>
  );
}
