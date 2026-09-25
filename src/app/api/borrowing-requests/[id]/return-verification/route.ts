import { NotificationType, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { returnVerificationSchema } from "@/lib/validation";
import { verifyReturn } from "@/lib/workflow";
import { apiErrorResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole([Role.ADMIN]);
    const { id } = await params;
    const parsed = returnVerificationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data pemeriksaan tidak valid." }, { status: 400 });
    const verification = await verifyReturn(id, actor, { ...parsed.data, issueType: parsed.data.issueType ?? undefined, issueDescription: parsed.data.issueDescription ?? undefined, followUpRecommendation: parsed.data.followUpRecommendation ?? undefined, context: { ipAddress: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent") } });
    const borrowing = await db.borrowingRequest.findUniqueOrThrow({ where: { id }, select: { borrowerId: true, status: true, registrationNumber: true } });
    try {
      await db.notification.create({ data: { userId: borrowing.borrowerId, type: borrowing.status === "COMPLETED" ? NotificationType.INFO : NotificationType.WARNING, title: borrowing.status === "COMPLETED" ? "Pengembalian diterima" : "Pengembalian perlu tindak lanjut", message: `Pemeriksaan ${borrowing.registrationNumber} telah selesai.`, link: `/peminjam/pengembalian/${id}` } });
    } catch (notificationError) {
      console.error("Notifikasi verifikasi pengembalian gagal dibuat", notificationError);
    }
    return NextResponse.json({ id: verification.id, status: borrowing.status });
  } catch (error) { return apiErrorResponse(error, "Pemeriksaan belum dapat diproses."); }
}
