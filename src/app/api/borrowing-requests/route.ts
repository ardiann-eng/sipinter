import { BorrowingStatus, ItemCondition, NotificationType, Role, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { borrowingRequestSchema } from "@/lib/validation";
import { transitionBorrowingRequest } from "@/lib/workflow";
import { apiErrorResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function registrationNumber() {
  const now = new Date();
  const month = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][now.getUTCMonth()];
  return `SIPINTER/PMK/${month}/${now.getUTCFullYear()}/${Date.now().toString().slice(-6)}`;
}

export async function POST(request: NextRequest) {
  let storedKeys: string[] = [];
  let createdRequestId: string | undefined;
  try {
    const user = await requireRole([Role.BORROWER]);
    const form = await request.formData();
    const ktp = form.get("ktp");
    const supporting = form.get("supporting");
    if (!(ktp instanceof File) || !(supporting instanceof File)) {
      return NextResponse.json({ error: "KTP dan dokumen pendukung wajib diunggah." }, { status: 400 });
    }
    const [ktpStored, supportingStored] = await Promise.all([storage.put(ktp), storage.put(supporting)]);
    storedKeys = [ktpStored.key, supportingStored.key];
    const items = JSON.parse(String(form.get("items") ?? "[]")) as unknown;
    const parsed = borrowingRequestSchema.safeParse({
      purpose: form.get("purpose"),
      activityLocation: form.get("location"),
      borrowDate: form.get("startDate"),
      plannedReturnDate: form.get("endDate"),
      ktpFile: ktpStored.key,
      approvalLetterFile: supportingStored.key,
      items,
    });
    if (!parsed.success) {
      await Promise.all([storage.delete(ktpStored.key), storage.delete(supportingStored.key)]);
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Pengajuan tidak valid." }, { status: 400 });
    }

    const record = await db.borrowingRequest.create({
      data: {
        registrationNumber: registrationNumber(),
        borrowerId: user.id,
        skpdId: user.skpdId,
        purpose: parsed.data.purpose,
        activityLocation: parsed.data.activityLocation,
        borrowDate: parsed.data.borrowDate,
        plannedReturnDate: parsed.data.plannedReturnDate,
        ktpFile: ktpStored.key,
        approvalLetterFile: supportingStored.key,
        status: BorrowingStatus.DRAFT,
        items: { create: parsed.data.items.map((item) => ({ ...item, initialCondition: item.initialCondition as ItemCondition })) },
      },
      select: { id: true },
    });
    createdRequestId = record.id;
    await transitionBorrowingRequest(record.id, BorrowingStatus.WAITING_ADMIN_VERIFICATION, user, {
      context: { ipAddress: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent") },
    });
    try {
      const admins = await db.user.findMany({
        where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
        select: { id: true },
      });
      if (admins.length) {
        await db.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: NotificationType.ACTION_REQUIRED,
            title: "Pengajuan peminjaman baru",
            message: `${user.name} mengirim pengajuan peminjaman yang perlu diverifikasi.`,
            link: `/admin/verifikasi/${record.id}`,
          })),
        });
      }
    } catch (notificationError) {
      console.error("Notifikasi admin gagal dibuat", notificationError);
    }
    return NextResponse.json({ id: record.id }, { status: 201 });
  } catch (error) {
    if (createdRequestId) {
      await db.borrowingRequest.delete({ where: { id: createdRequestId } }).catch(() => undefined);
    }
    await Promise.all(storedKeys.map((key) => storage.delete(key).catch(() => undefined)));
    console.error("Pengajuan peminjaman gagal", error);
    return apiErrorResponse(error, "Pengajuan belum dapat diproses.");
  }
}
