const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+()-]{7,}$/;

export function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string) {
  return PHONE_RE.test(value.trim());
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export type CompanionInput = {
  hasCompanion?: boolean;
  companionName?: string;
  companionPhone?: string;
};

export type ParsedCompanion = {
  companionName: string | null;
  companionPhone: string | null;
};

export function parseCompanion(
  input: CompanionInput
):
  | { ok: true; value: ParsedCompanion }
  | { ok: false; field: "companionName" | "companionPhone" } {
  if (!input.hasCompanion) {
    return { ok: true, value: { companionName: null, companionPhone: null } };
  }

  const companionName = input.companionName?.trim() ?? "";
  const companionPhone = input.companionPhone?.trim() ?? "";

  if (companionName.length < 2) {
    return { ok: false, field: "companionName" };
  }
  if (!isValidPhone(companionPhone)) {
    return { ok: false, field: "companionPhone" };
  }

  return { ok: true, value: { companionName, companionPhone } };
}
