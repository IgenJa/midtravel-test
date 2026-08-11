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
