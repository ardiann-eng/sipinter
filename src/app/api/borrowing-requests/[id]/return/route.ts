import { CompletenessStatus, NotificationType, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { returnSubmissionSchema } from "@/lib/validation";
import { submitReturn } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole([Role.BORROWER]);
  const { id } = await params;
  const form = await request.formData();
  const files = form.getAll("photos").filter((value): value is File => value instanceof File);
  try {
    const stored = await Promise.all(files.map((file) => storage.put(file)));
    const parsed = returnSubmissionSchema.safeParse({
      actualReturnDate: form.get("returnedAt"),
      submittedCondition: form.get("condition"),
      completenessStatus: form.get("condition") === "GOOD" ? CompletenessStatus.COMPLETE : CompletenessStatus.INCOMPLETE,
      notes: form.get("note") || undefined,
      photos: stored.map((file, index) => ({ fileUrl: file.key, storageKey: file.key, originalName: file.originalName, mimeType: file.mimeType, size: file.size, photoType: `RETURN_EVIDENCE_${index + 1}` })),
    });
    if (!parsed.success) {
      await Promise.all(stored.map((file) => storage.delete(file.key)));
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data pengembalian tidak valid." }, { status: 400 });
    }
    const submission = await submitReturn(id, actor, {
      ...parsed.data,
      notes: parsed.data.notes ?? undefined,
      photos: parsed.data.photos.map((photo) => ({ ...photo, description: photo.description ?? undefined, storageKey: photo.storageKey ?? undefined, originalName: photo.originalName ?? undefined })),
      context: { ipAddress: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent") },
    });
    const admins = await db.user.findMany({ where: { role: Role.ADMIN, status: "ACTIVE", skpdId: actor.skpdId }, select: { id: true } });
    if (admins.length) await db.notification.createMany({ data: admins.map((admin) => ({ userId: admin.id, type: NotificationType.ACTION_REQUIRED, title: "Pengembalian perlu diverifikasi", message: "Peminjam telah mengirim bukti kondisi akhir kendaraan.", link: `/admin/pengembalian/${id}` })) });
    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Pengembalian belum dapat diproses." }, { status: 400 });
  }
}
