import { NextRequest, NextResponse } from "next/server";
import { Role, UserStatus } from "@prisma/client";
import { runBorrowingMaintenance } from "@/lib/borrowing-maintenance";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET belum dikonfigurasi." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  const admin = await db.user.findFirst({ where: { role: Role.ADMIN, status: UserStatus.ACTIVE }, select: { id: true, skpdId: true, name: true, email: true, role: true } });
  if (!admin) return NextResponse.json({ error: "Administrator aktif tidak ditemukan." }, { status: 503 });
  return NextResponse.json(await runBorrowingMaintenance(admin));
}
