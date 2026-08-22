import { Download } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

type Props = {
  title: string;
  lastUpdated: string;
  intro: string;
  downloadLabel: string;
  viewerTitle: string;
  pdfHref: string;
};

export function LegalDocumentPage({
  title,
  lastUpdated,
  intro,
  downloadLabel,
  viewerTitle,
  pdfHref,
}: Props) {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h1 className="font-display text-4xl font-bold text-slate-900">
            {title}
          </h1>
          <p className="mt-4 text-slate-500">{lastUpdated}</p>
          <p className="mt-6 max-w-3xl text-slate-600 leading-relaxed">{intro}</p>

          <a
            href={pdfHref}
            download
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border-2 border-teal-600 px-6 py-3 text-base font-semibold text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            {downloadLabel}
          </a>

          <div className="relative mt-10 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
            <iframe
              title={viewerTitle}
              src={`${pdfHref}#toolbar=1&navpanes=0`}
              className="h-[min(80vh,56rem)] w-full border-0"
            />
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
