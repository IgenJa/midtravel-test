type LegalDocView = {
  label: string;
  version: string | null;
  sha256: string | null;
  href: string | null;
};

type Labels = {
  title: string;
  acceptedAt: string;
  hash: string;
  missing: string;
  openPdf: string;
};

type Props = {
  acceptedAt: string | null;
  privacy: LegalDocView;
  contract: LegalDocView;
  labels: Labels;
};

function DocumentRow({
  doc,
  hashLabel,
  openPdf,
}: {
  doc: LegalDocView;
  hashLabel: string;
  openPdf: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {doc.label}
      </dt>
      <dd className="mt-1 text-slate-700">
        {doc.version ? (
          <>
            <p className="font-medium text-slate-900">{doc.version}</p>
            {doc.sha256 ? (
              <p className="mt-1 break-all font-mono text-xs text-slate-500">
                {hashLabel} {doc.sha256}
              </p>
            ) : null}
            {doc.href ? (
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${openPdf}: ${doc.label}`}
                className="mt-2 inline-block text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                {openPdf}
              </a>
            ) : null}
          </>
        ) : (
          "—"
        )}
      </dd>
    </div>
  );
}

export function LegalAcceptancePanel({
  acceptedAt,
  privacy,
  contract,
  labels,
}: Props) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-slate-900">{labels.title}</h2>
      {acceptedAt ? (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {labels.acceptedAt}
            </dt>
            <dd className="mt-1 font-medium text-slate-900">{acceptedAt}</dd>
          </div>
          <DocumentRow
            doc={privacy}
            hashLabel={labels.hash}
            openPdf={labels.openPdf}
          />
          <DocumentRow
            doc={contract}
            hashLabel={labels.hash}
            openPdf={labels.openPdf}
          />
        </dl>
      ) : (
        <p className="mt-3 text-sm text-slate-600">{labels.missing}</p>
      )}
    </section>
  );
}
