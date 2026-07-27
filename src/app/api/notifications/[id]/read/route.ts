import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  const notification = await db.notification.findFirst({
    where: { id, userId: user.id },
    select: { id: true, readAt: true },
  });

  if (!notification) {
    return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
  }
  if (!notification.readAt) {
    await db.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
  return NextResponse.json({ ok: true });
}
