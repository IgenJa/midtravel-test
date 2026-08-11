import { NextResponse } from "next/server";
import { getSession, isAdminRole } from "@/lib/session";
import { uploadImage, type UploadFolder } from "@/lib/upload-image";

const FOLDERS = new Set<UploadFolder>([
  "trips",
  "team",
  "testimonials",
  "misc",
]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folderRaw = String(formData.get("folder") ?? "misc");
  const folder = (FOLDERS.has(folderRaw as UploadFolder)
    ? folderRaw
    : "misc") as UploadFolder;

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, code: "NO_FILE" }, { status: 400 });
  }

  const result = await uploadImage(file, folder);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
