import { BorrowingStatus, NotificationType, Role, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { transitionBorrowingRequest } from "@/lib/workflow";
import { apiErrorResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const actions = {
  REQUEST_REVISION: BorrowingStatus.REVISION_REQUIRED,
  REJECT: BorrowingStatus.REJECTED,
  FORWARD_TO_APPROVER: BorrowingStatus.WAITING_SEKDA_APPROVAL,
  APPROVE: BorrowingStatus.APPROVED,
} as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireUser();
    const { id } = await params;
    const body = await request.json() as { action?: keyof typeof actions; note?: string };
    const target = body.action ? actions[body.action] : undefined;
    if (!target) return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
    const updated = await transitionBorrowingRequest(id, target, actor, {
      note: body.note,
      context: { ipAddress: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent") },
    });
    const title = target === BorrowingStatus.APPROVED ? "Pengajuan disetujui" : target === BorrowingStatus.REJECTED ? "Pengajuan ditolak" : target === BorrowingStatus.REVISION_REQUIRED ? "Pengajuan perlu revisi" : "Pengajuan diteruskan untuk persetujuan";
    try {
      await db.notification.create({ data: { userId: updated.borrowerId, type: target === BorrowingStatus.REJECTED || target === BorrowingStatus.REVISION_REQUIRED ? NotificationType.WARNING : NotificationType.INFO, title, message: body.note?.trim() || `Status ${updated.registrationNumber} telah diperbarui.`, link: `/peminjam/peminjaman/${updated.id}` } });
      if (target === BorrowingStatus.WAITING_SEKDA_APPROVAL) {
        const approvers = await db.user.findMany({
          where: { role: Role.APPROVER, status: UserStatus.ACTIVE },
          select: { id: true },
        });
        if (approvers.length) {
          await db.notification.createMany({
            data: approvers.map((approver) => ({
              userId: approver.id,
              type: NotificationType.ACTION_REQUIRED,
              title: "Permohonan menunggu persetujuan",
              message: `${updated.registrationNumber} telah lolos verifikasi administrator.`,
              link: `/sekda/menunggu/${updated.id}`,
            })),
          });
        }
      }
    } catch (notificationError) {
      console.error("Notifikasi perubahan status gagal dibuat", notificationError);
    }
    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    return apiErrorResponse(error, "Aksi belum dapat diproses.");
  }
}
