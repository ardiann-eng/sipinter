import { AuditAction, Role, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { canManageUser } from "@/lib/authorization";
import { db } from "@/lib/db";

const schema = z.object({
  role: z.enum([Role.BORROWER, Role.APPROVER]),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole([Role.ADMIN]);
    const { id } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Peran atau status pengguna tidak valid." }, { status: 400 });
    const target = await db.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    if (!canManageUser(actor.role, target.role)) return NextResponse.json({ error: "Akun administrator tidak dapat diubah dari halaman ini." }, { status: 403 });
    await db.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({ data: { skpdId: actor.skpdId, userId: actor.id, action: AuditAction.UPDATE, module: "USERS", objectType: "User", objectId: id, previousValue: { role: target.role, status: target.status }, newValue: parsed.data } });
    });
    return NextResponse.json({ id });
  } catch (error) {
    return apiErrorResponse(error, "Akses pengguna belum dapat diperbarui.");
  }
}
