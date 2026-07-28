import { NotificationType, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { returnVerificationSchema } from "@/lib/validation";
import { verifyReturn } from "@/lib/workflow";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole([Role.ADMIN]);
  const { id } = await params;
  const parsed = returnVerificationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data pemeriksaan tidak valid." }, { status: 400 });
  try {
    const verification = await verifyReturn(id, actor, { ...parsed.data, issueType: parsed.data.issueType ?? undefined, issueDescription: parsed.data.issueDescription ?? undefined, followUpRecommendation: parsed.data.followUpRecommendation ?? undefined, context: { ipAddress: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent") } });
    const borrowing = await db.borrowingRequest.findUniqueOrThrow({ where: { id }, select: { borrowerId: true, status: true, registrationNumber: true } });
    await db.notification.create({ data: { userId: borrowing.borrowerId, type: borrowing.status === "COMPLETED" ? NotificationType.INFO : NotificationType.WARNING, title: borrowing.status === "COMPLETED" ? "Pengembalian diterima" : "Pengembalian perlu tindak lanjut", message: `Pemeriksaan ${borrowing.registrationNumber} telah selesai.`, link: `/peminjam/pengembalian/${id}` } });
    return NextResponse.json({ id: verification.id, status: borrowing.status });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Pemeriksaan belum dapat diproses." }, { status: 400 }); }
}
