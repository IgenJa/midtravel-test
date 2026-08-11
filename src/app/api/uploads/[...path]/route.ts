import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const segments = (await params).path ?? [];
  if (segments.length === 0 || segments.some((part) => part.includes(".."))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const absolute = path.join(getUploadDir(), ...segments);

  try {
    const fileStat = await stat(absolute);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = await readFile(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
