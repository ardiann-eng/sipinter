import { AuditAction, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiErrorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  standardDurationDays: z.number().int().min(1).max(90),
  minimumLeadDays: z.number().int().min(0).max(30),
  returnReminder: z.boolean(),
  overdueEscalation: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireRole([Role.ADMIN]);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Pengaturan tidak valid." }, { status: 400 });
    await db.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(parsed.data)) {
        await tx.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
      }
      await tx.auditLog.create({ data: { skpdId: actor.skpdId, userId: actor.id, action: AuditAction.UPDATE, module: "SETTINGS", objectType: "Setting", newValue: parsed.data } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error, "Pengaturan belum dapat disimpan.");
  }
}
