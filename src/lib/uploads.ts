import { mkdir } from "fs/promises";
import path from "path";

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
