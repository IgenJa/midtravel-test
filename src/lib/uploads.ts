import { mkdir } from "fs/promises";
import path from "path";

/** Served upload types. SVG is omitted — browsers execute scripts in image/svg+xml. */
export const UPLOAD_CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Absolute upload directory on the VPS / local machine. */
export function getUploadDir() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "uploads");
}

export async function ensureUploadDir(...segments: string[]) {
  const dir = path.join(getUploadDir(), ...segments);
  await mkdir(dir, { recursive: true });
  return dir;
}
