import { BorrowingStatus, NotificationType, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { transitionBorrowingRequest } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const actions = {
  REQUEST_REVISION: BorrowingStatus.REVISION_REQUIRED,
  REJECT: BorrowingStatus.REJECTED,
  FORWARD_TO_APPROVER: BorrowingStatus.WAITING_SEKDA_APPROVAL,
  APPROVE: BorrowingStatus.APPROVED,
} as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireUser();
  const { id } = await params;
  const body = await request.json() as { action?: keyof typeof actions; note?: string };
  const target = body.action ? actions[body.action] : undefined;
  if (!target) return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  try {
    const updated = await transitionBorrowingRequest(id, target, actor, {
      note: body.note,
      context: { ipAddress: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent") },
    });
    const title = target === BorrowingStatus.APPROVED ? "Pengajuan disetujui" : target === BorrowingStatus.REJECTED ? "Pengajuan ditolak" : target === BorrowingStatus.REVISION_REQUIRED ? "Pengajuan perlu revisi" : "Pengajuan diteruskan untuk persetujuan";
    await db.notification.create({ data: { userId: updated.borrowerId, type: target === BorrowingStatus.REJECTED || target === BorrowingStatus.REVISION_REQUIRED ? NotificationType.WARNING : NotificationType.INFO, title, message: body.note?.trim() || `Status ${updated.registrationNumber} telah diperbarui.`, link: `/peminjam/peminjaman/${updated.id}` } });
    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Aksi belum dapat diproses." }, { status: 400 });
  }
}
