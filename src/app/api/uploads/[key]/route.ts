import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { Role } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mimeTypes: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const user = await requireUser();
    const { key } = await params;
    const linkedRequest = await db.borrowingRequest.findFirst({
      where: {
        ...(user.role === Role.BORROWER ? { borrowerId: user.id } : {}),
        OR: [
          { ktpFile: key },
          { approvalLetterFile: key },
          { handoverRecord: { is: { proofFile: key } } },
          { returnSubmissions: { some: { photos: { some: { OR: [{ storageKey: key }, { fileUrl: key }] } } } } },
        ],
      },
      select: { id: true },
    });
    if (!linkedRequest) {
      return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 });
    }
    const bytes = await storage.get(key);
    const extension = key.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(Uint8Array.from(bytes).buffer, {
      headers: {
        "content-type": mimeTypes[extension] ?? "application/octet-stream",
        "content-disposition": `inline; filename="${key}"`,
        "cache-control": "private, max-age=300",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return apiErrorResponse(error, "Berkas tidak ditemukan.");
  }
}
