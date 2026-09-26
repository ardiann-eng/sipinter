import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-response";
import { createApprovalLetter, hasSekdaApproval } from "@/lib/approval-letter";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireUser();
    const { id } = await params;
    const record = await db.borrowingRequest.findUnique({
      where: { id },
      include: {
        borrower: { include: { skpd: true } },
        items: { include: { item: true } },
        approvalRecords: { include: { approver: true } },
      },
    });
    if (!record || (actor.role === Role.BORROWER && record.borrowerId !== actor.id)) {
      return NextResponse.json({ error: "Surat tidak ditemukan." }, { status: 404 });
    }
    const bytes = await createApprovalLetter(record);
    const filename = `${hasSekdaApproval(record) ? "Surat_Persetujuan" : "Draf_Surat_Persetujuan"}_${record.registrationNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.docx`;
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiErrorResponse(error, "Surat belum dapat dibuat.");
  }
}
