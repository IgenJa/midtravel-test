export type LegalDocumentKind = "privacy" | "contract";

export type LegalDocument = {
  version: string;
  href: string;
  fileName: string;
  sha256: string;
};

/**
 * Currently published PDFs.
 *
 * Új szerződés / tájékoztató = új fájl + új verzió. A régit ne töröld és
 * ne írd felül: tedd a régi bejegyzést LEGAL_DOCUMENT_ARCHIVE-ba, hogy a
 * korábbi foglalások hash alapján megnyithassák a PDF-et, amit elfogadtak.
 * Lépések: docs/HANDOFF.md → „Jogi PDF-ek cseréje”.
 */
export const LEGAL_DOCUMENTS: Record<LegalDocumentKind, LegalDocument> = {
  privacy: {
    version: "2024",
    href: "/docs/MID_Adatkezelesi_tajekoztato_2024.pdf",
    fileName: "MID_Adatkezelesi_tajekoztato_2024.pdf",
    sha256:
      "85c19aed16f2ab20b8ab5f452adb07759138b5ddb554f5747f2845d384642e31",
  },
  contract: {
    version: "2025",
    href: "/docs/utazasi_szerzodes_2025.pdf",
    fileName: "utazasi_szerzodes_2025.pdf",
    sha256:
      "5cd54777e43511cdda6bb05ffbb88472c764aecb97f0cc52744960e12aaee78c",
  },
};

export const LEGAL_DOCUMENT_ARCHIVE: Record<
  LegalDocumentKind,
  readonly LegalDocument[]
> = {
  privacy: [],
  contract: [],
};

export const LEGAL_DOCS = {
  privacyPdf: LEGAL_DOCUMENTS.privacy.href,
  contractPdf: LEGAL_DOCUMENTS.contract.href,
} as const;

export function findLegalDocument(
  kind: LegalDocumentKind,
  version: string
): LegalDocument | null {
  const current = LEGAL_DOCUMENTS[kind];
  if (current.version === version) return current;
  return (
    LEGAL_DOCUMENT_ARCHIVE[kind].find((doc) => doc.version === version) ?? null
  );
}

export function legalDocumentHref(
  kind: LegalDocumentKind,
  version: string | null
): string | null {
  if (!version) return null;
  return findLegalDocument(kind, version)?.href ?? null;
}
