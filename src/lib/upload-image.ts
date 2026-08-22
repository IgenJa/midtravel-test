import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ensureUploadDir, getUploadDir } from "@/lib/uploads";
import {
  validateImageContents,
  validateImageMeta,
} from "@/lib/upload-validation";

export type UploadFolder = "trips" | "team" | "testimonials" | "misc";

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; code: "INVALID_TYPE" | "TOO_LARGE" | "UPLOAD_FAILED" };

function usesVercelBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function uploadLocal(
  buffer: Buffer,
  folder: UploadFolder,
  ext: string
): Promise<string> {
  const dir = await ensureUploadDir(folder);
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const absolute = path.join(dir, filename);
  await writeFile(absolute, buffer);
  return `/api/uploads/${folder}/${filename}`;
}

async function uploadBlob(
  buffer: Buffer,
  folder: UploadFolder,
  ext: string,
  contentType: string
): Promise<string> {
  const filename = `${folder}/${Date.now()}-${randomUUID()}${ext}`;
  const blob = await put(filename, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });
  return blob.url;
}

export async function uploadImage(
  file: File,
  folder: UploadFolder = "misc"
): Promise<UploadResult> {
  const meta = validateImageMeta({
    type: file.type,
    name: file.name,
    size: file.size,
  });
  if (!meta.ok) {
    return meta;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validateImageContents(buffer, file.type)) {
    return { ok: false, code: "INVALID_TYPE" };
  }
  const { ext } = meta;

  try {
    const url = usesVercelBlob()
      ? await uploadBlob(buffer, folder, ext, file.type)
      : await uploadLocal(buffer, folder, ext);
    return { ok: true, url };
  } catch {
    return { ok: false, code: "UPLOAD_FAILED" };
  }
}

export async function ensureUploadRoot() {
  await mkdir(getUploadDir(), { recursive: true });
}
