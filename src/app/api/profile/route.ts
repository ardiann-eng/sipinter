import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileContactSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  const actor = await requireUser();
  const parsed = profileContactSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data profil tidak valid." }, { status: 400 });
  const user = await db.user.update({ where: { id: actor.id }, data: { phone: parsed.data.phone }, select: { phone: true } });
  return NextResponse.json(user);
}
