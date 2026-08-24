import { describe, expect, it } from "vitest";
import {
  findLegalDocument,
  LEGAL_DOCUMENT_ARCHIVE,
  LEGAL_DOCUMENTS,
  legalDocumentHref,
} from "@/data/legal-docs";
import {
  assertLegalPdfHash,
  assertPublishedLegalPdfs,
  createLegalAcceptanceSnapshot,
  hashLegalPdf,
} from "@/lib/legal-acceptance";

describe("findLegalDocument", () => {
  it("returns the current published document by version", () => {
    expect(findLegalDocument("privacy", "2024")).toEqual(LEGAL_DOCUMENTS.privacy);
    expect(findLegalDocument("contract", "2025")).toEqual(
      LEGAL_DOCUMENTS.contract
    );
  });

  it("returns an archived document and null for unknown versions", () => {
    expect(LEGAL_DOCUMENT_ARCHIVE.contract).toEqual([]);
    expect(findLegalDocument("contract", "2019")).toBeNull();
    expect(legalDocumentHref("contract", null)).toBeNull();
    expect(legalDocumentHref("contract", "2025")).toBe(
      LEGAL_DOCUMENTS.contract.href
    );
  });
});

describe("legal PDF fingerprints", () => {
  it("matches the committed SHA-256 of the published files", () => {
    expect(hashLegalPdf(LEGAL_DOCUMENTS.privacy.fileName)).toBe(
      LEGAL_DOCUMENTS.privacy.sha256
    );
    expect(hashLegalPdf(LEGAL_DOCUMENTS.contract.fileName)).toBe(
      LEGAL_DOCUMENTS.contract.sha256
    );
    expect(() => assertPublishedLegalPdfs()).not.toThrow();
  });

  it("snapshots the current versions at accept time", () => {
    const before = Date.now();
    const snapshot = createLegalAcceptanceSnapshot();
    const after = Date.now();

    expect(snapshot.privacyDocVersion).toBe("2024");
    expect(snapshot.contractDocVersion).toBe("2025");
    expect(snapshot.privacyDocSha256).toBe(LEGAL_DOCUMENTS.privacy.sha256);
    expect(snapshot.contractDocSha256).toBe(LEGAL_DOCUMENTS.contract.sha256);
    expect(snapshot.privacyDocSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(snapshot.termsAcceptedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(snapshot.termsAcceptedAt.getTime()).toBeLessThanOrEqual(after);
  });

  it("rejects a silently replaced PDF", () => {
    expect(() =>
      assertLegalPdfHash(LEGAL_DOCUMENTS.contract.fileName, "0".repeat(64))
    ).toThrow(/hash mismatch/);
  });
});
