import { FadeIn } from "@/components/ui/AnimatedSection";
import { Card } from "@/components/ui/Card";
import type { TripDay } from "@/types";

interface TripProgramProps {
  program: TripDay[];
  dayLabel: (day: number) => string;
}

export function TripProgram({ program, dayLabel }: TripProgramProps) {
  return (
    <div className="relative">
      <div
        className="absolute bottom-4 left-5 top-4 hidden w-0.5 bg-gradient-to-b from-teal-300 via-teal-200 to-teal-100 sm:block"
        aria-hidden
      />

      <div className="space-y-6">
        {program.map((day, index) => (
          <FadeIn key={day.day} delay={index * 0.05}>
            <div className="relative sm:pl-16">
              <div className="mb-3 flex items-center gap-3 sm:absolute sm:left-0 sm:top-6 sm:mb-0 sm:block">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-400 text-sm font-bold text-white shadow-md ring-4 ring-white sm:h-12 sm:w-12 sm:text-base">
                  {day.day}
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 sm:hidden">
                  {dayLabel(day.day)}
                </span>
              </div>

              <Card hover={false} className="overflow-hidden p-0">
                <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-white px-5 py-3 sm:px-6">
                  <p className="hidden text-sm font-semibold uppercase tracking-wide text-teal-700 sm:block">
                    {dayLabel(day.day)}
                  </p>
                  <h3 className="font-display text-lg font-bold text-slate-900 sm:mt-1 sm:text-xl">
                    {day.title}
                  </h3>
                </div>
                <div className="px-5 py-4 sm:px-6 sm:py-5">
                  <p className="leading-relaxed text-slate-600">{day.description}</p>
                </div>
              </Card>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
