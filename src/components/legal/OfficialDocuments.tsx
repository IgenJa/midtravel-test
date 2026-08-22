import { Download } from "lucide-react";
import { LEGAL_DOCS } from "@/data/legal-docs";

type PdfItem = {
  id: string;
  href: string;
  title: string;
  caption: string;
  downloadLabel: string;
  viewerTitle: string;
};

type Props = {
  privacyTitle: string;
  privacyCaption: string;
  contractTitle: string;
  contractCaption: string;
  downloadLabel: string;
  documentsHeading: string;
};

function LegalPdfCard({
  id,
  href,
  title,
  caption,
  downloadLabel,
  viewerTitle,
}: PdfItem) {
  return (
    <article
      id={id}
      className="scroll-mt-28 flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
    >
      <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{caption}</p>
      <a
        href={href}
        download
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border-2 border-teal-600 px-5 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
      >
        <Download className="h-4 w-4" />
        {downloadLabel}
      </a>
      <div className="relative mt-4 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
        <iframe
          title={viewerTitle}
          src={`${href}#toolbar=1&navpanes=0`}
          className="h-[28rem] w-full border-0 lg:h-[36rem]"
        />
      </div>
    </article>
  );
}

export function OfficialDocuments({
  privacyTitle,
  privacyCaption,
  contractTitle,
  contractCaption,
  downloadLabel,
  documentsHeading,
}: Props) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold text-slate-900">
        {documentsHeading}
      </h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LegalPdfCard
          id="adatkezelesi-tajekoztato"
          href={LEGAL_DOCS.privacyPdf}
          title={privacyTitle}
          caption={privacyCaption}
          downloadLabel={downloadLabel}
          viewerTitle={privacyTitle}
        />
        <LegalPdfCard
          id="utazasi-szerzodes"
          href={LEGAL_DOCS.contractPdf}
          title={contractTitle}
          caption={contractCaption}
          downloadLabel={downloadLabel}
          viewerTitle={contractTitle}
        />
      </div>
    </section>
  );
}
