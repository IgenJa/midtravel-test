import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LEGAL_DOCUMENTS } from "@/data/legal-docs";

export type LegalAcceptanceSnapshot = {
  termsAcceptedAt: Date;
  privacyDocVersion: string;
  privacyDocSha256: string;
  contractDocVersion: string;
  contractDocSha256: string;
};

export function getLegalPdfPath(fileName: string) {
  return path.join(process.cwd(), "public", "docs", fileName);
}

export function hashLegalPdf(fileName: string): string {
  const bytes = readFileSync(getLegalPdfPath(fileName));
  return createHash("sha256").update(bytes).digest("hex");
}

export function assertLegalPdfHash(fileName: string, expectedSha256: string) {
  const actual = hashLegalPdf(fileName);
  if (actual !== expectedSha256) {
    throw new Error(
      `Legal PDF hash mismatch for ${fileName}: expected ${expectedSha256}, got ${actual}. Add a new file and bump the version instead of overwriting.`
    );
  }
}

export function assertPublishedLegalPdfs() {
  for (const doc of Object.values(LEGAL_DOCUMENTS)) {
    assertLegalPdfHash(doc.fileName, doc.sha256);
  }
}

export function createLegalAcceptanceSnapshot(): LegalAcceptanceSnapshot {
  assertPublishedLegalPdfs();
  return {
    termsAcceptedAt: new Date(),
    privacyDocVersion: LEGAL_DOCUMENTS.privacy.version,
    privacyDocSha256: LEGAL_DOCUMENTS.privacy.sha256,
    contractDocVersion: LEGAL_DOCUMENTS.contract.version,
    contractDocSha256: LEGAL_DOCUMENTS.contract.sha256,
  };
}
