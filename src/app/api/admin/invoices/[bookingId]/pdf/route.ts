import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { getSession, isAdminRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUploadDir } from "@/lib/uploads";

type Params = { params: Promise<{ bookingId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || !isAdminRole(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { bookingId } = await params;
  if (!bookingId || bookingId.includes("..") || bookingId.includes("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { bookingId },
    select: { invoiceNumber: true, pdfUrl: true },
  });

  if (!invoice?.pdfUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const absolute = path.join(getUploadDir(), "invoices", `${bookingId}.pdf`);

  try {
    const fileStat = await stat(absolute);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = await readFile(absolute);
    const filename = `${invoice.invoiceNumber ?? bookingId}.pdf`;

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
