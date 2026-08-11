import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ensureUploadDir, getUploadDir } from "@/lib/uploads";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_BYTES = 8 * 1024 * 1024;

export type UploadFolder = "trips" | "team" | "testimonials" | "misc";

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; code: "INVALID_TYPE" | "TOO_LARGE" | "UPLOAD_FAILED" };

function extensionFor(file: File): string {
  const fromName = path.extname(file.name).toLowerCase();
  if (fromName && fromName.length <= 8) return fromName;
  switch (file.type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    default:
      return ".bin";
  }
}

function usesVercelBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function uploadLocal(file: File, folder: UploadFolder): Promise<string> {
  const dir = await ensureUploadDir(folder);
  const filename = `${Date.now()}-${randomUUID()}${extensionFor(file)}`;
  const absolute = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolute, buffer);
  return `/api/uploads/${folder}/${filename}`;
}

async function uploadBlob(file: File, folder: UploadFolder): Promise<string> {
  const filename = `${folder}/${Date.now()}-${randomUUID()}${extensionFor(file)}`;
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function uploadImage(
  file: File,
  folder: UploadFolder = "misc"
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, code: "INVALID_TYPE" };
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return { ok: false, code: "TOO_LARGE" };
  }

  try {
    const url = usesVercelBlob()
      ? await uploadBlob(file, folder)
      : await uploadLocal(file, folder);
    return { ok: true, url };
  } catch {
    return { ok: false, code: "UPLOAD_FAILED" };
  }
}

export async function ensureUploadRoot() {
  await mkdir(getUploadDir(), { recursive: true });
}
