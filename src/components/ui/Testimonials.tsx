"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import type { Testimonial } from "@/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2">
      {testimonials.map((testimonial) => (
        <StaggerItem key={testimonial.id}>
          <Card className="relative h-full">
            <Quote className="absolute right-6 top-6 h-8 w-8 text-teal-100" />
            <div className="flex items-center gap-1">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-teal-300 text-teal-300"
                />
              ))}
            </div>
            <p className="mt-4 text-slate-600 leading-relaxed">
              &ldquo;{testimonial.text}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Image
                src={testimonial.avatar || "/profile-placeholder.svg"}
                alt={testimonial.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-slate-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-slate-500">{testimonial.location}</p>
              </div>
            </div>
          </Card>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
