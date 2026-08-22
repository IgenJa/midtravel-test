import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { getUploadDir, UPLOAD_CONTENT_TYPES } from "@/lib/uploads";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const segments = (await params).path ?? [];
  if (segments.length === 0 || segments.some((part) => part.includes(".."))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const absolute = path.join(getUploadDir(), ...segments);
  const ext = path.extname(absolute).toLowerCase();
  const contentType = UPLOAD_CONTENT_TYPES[ext];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const fileStat = await stat(absolute);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = await readFile(absolute);

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
