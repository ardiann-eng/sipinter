import { NotificationType, Role, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOperationalSettings, validateBorrowingPolicy } from "@/lib/operational-settings";
import { storage } from "@/lib/storage";
import { borrowingRequestSchema } from "@/lib/validation";
import { resubmitBorrowingRequest } from "@/lib/workflow";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const storedKeys: string[] = [];
  try {
    const actor = await requireRole([Role.BORROWER]);
    const { id } = await params;
    const current = await db.borrowingRequest.findFirst({
      where: { id, borrowerId: actor.id, status: "REVISION_REQUIRED" },
      select: { ktpFile: true, approvalLetterFile: true },
    });
    if (!current) return NextResponse.json({ error: "Pengajuan revisi tidak ditemukan." }, { status: 404 });

    const form = await request.formData();
    const ktp = form.get("ktp");
    const supporting = form.get("supporting");
    const ktpStored = ktp instanceof File && ktp.size ? await storage.put(ktp) : null;
    if (ktpStored) storedKeys.push(ktpStored.key);
    const supportingStored = supporting instanceof File && supporting.size ? await storage.put(supporting) : null;
    if (supportingStored) storedKeys.push(supportingStored.key);
    const items = JSON.parse(String(form.get("items") ?? "[]")) as unknown;
    const parsed = borrowingRequestSchema.safeParse({
      purpose: form.get("purpose"),
      activityLocation: form.get("location"),
      borrowDate: form.get("startDate"),
      plannedReturnDate: form.get("endDate"),
      ktpFile: ktpStored?.key ?? current.ktpFile,
      approvalLetterFile: supportingStored?.key ?? current.approvalLetterFile,
      items,
    });
    if (!parsed.success) {
      await Promise.all(storedKeys.map((key) => storage.delete(key).catch(() => undefined)));
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data revisi tidak valid." }, { status: 400 });
    }
    validateBorrowingPolicy(parsed.data.borrowDate, parsed.data.plannedReturnDate, await getOperationalSettings());
    const updated = await resubmitBorrowingRequest(id, actor, {
      ...parsed.data,
      context: { ipAddress: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent") },
    });
    await Promise.all([
      ktpStored && current.ktpFile ? storage.delete(current.ktpFile).catch(() => undefined) : Promise.resolve(),
      supportingStored && current.approvalLetterFile ? storage.delete(current.approvalLetterFile).catch(() => undefined) : Promise.resolve(),
    ]);
    storedKeys.length = 0;
    try {
      const admins = await db.user.findMany({ where: { role: Role.ADMIN, status: UserStatus.ACTIVE }, select: { id: true } });
      if (admins.length) await db.notification.createMany({ data: admins.map((admin) => ({ userId: admin.id, type: NotificationType.ACTION_REQUIRED, title: "Revisi pengajuan dikirim", message: `${updated.registrationNumber} telah diperbaiki dan perlu diverifikasi kembali.`, link: `/admin/verifikasi/${updated.id}` })) });
    } catch (notificationError) {
      console.error("Notifikasi revisi gagal dibuat", notificationError);
    }
    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    await Promise.all(storedKeys.map((key) => storage.delete(key).catch(() => undefined)));
    return apiErrorResponse(error, "Revisi pengajuan belum dapat dikirim.");
  }
}
