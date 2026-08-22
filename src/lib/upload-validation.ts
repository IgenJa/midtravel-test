import path from "path";

/** Raster types only — SVG is rejected (stored XSS if served as image/svg+xml). */
export const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const UPLOAD_EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const BLOCKED_UPLOAD_EXTENSIONS = new Set([
  ".svg",
  ".svgz",
  ".html",
  ".htm",
  ".xhtml",
  ".xml",
  ".js",
  ".mjs",
]);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type ImageUploadValidation =
  | { ok: true; ext: string }
  | { ok: false; code: "INVALID_TYPE" | "TOO_LARGE" };

export function extensionForUpload(mime: string): string | null {
  return UPLOAD_EXT_BY_TYPE[mime] ?? null;
}

export function hasBlockedUploadExtension(filename: string): boolean {
  return BLOCKED_UPLOAD_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

export function looksLikeMarkup(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 512).toString("utf8");
  return /<(?:\?xml|!doctype\s+html|html|svg|script)\b/i.test(head);
}

export function matchesRasterMagic(buffer: Buffer, mime: string): boolean {
  if (buffer.length < 12) return false;

  switch (mime) {
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    case "image/gif":
      return (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38
      );
    case "image/webp":
      return (
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );
    default:
      return false;
  }
}

export function validateImageMeta(input: {
  type: string;
  name: string;
  size: number;
}): ImageUploadValidation {
  const ext = extensionForUpload(input.type);
  if (
    !ALLOWED_UPLOAD_TYPES.has(input.type) ||
    !ext ||
    hasBlockedUploadExtension(input.name)
  ) {
    return { ok: false, code: "INVALID_TYPE" };
  }
  if (input.size <= 0 || input.size > MAX_UPLOAD_BYTES) {
    return { ok: false, code: "TOO_LARGE" };
  }
  return { ok: true, ext };
}

export function validateImageContents(buffer: Buffer, mime: string): boolean {
  return !looksLikeMarkup(buffer) && matchesRasterMagic(buffer, mime);
}

export function validateImageUpload(input: {
  type: string;
  name: string;
  size: number;
  buffer: Buffer;
}): ImageUploadValidation {
  const meta = validateImageMeta(input);
  if (!meta.ok) return meta;
  if (!validateImageContents(input.buffer, input.type)) {
    return { ok: false, code: "INVALID_TYPE" };
  }
  return meta;
}
