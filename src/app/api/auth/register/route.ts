import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashNik } from "@/lib/registration";
import { hashPassword } from "@/lib/auth";
import { registrationSchema } from "@/lib/validation";
import { Role } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = registrationSchema.safeParse({ ...body, consent: body.consent === true || body.consent === "on" });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid." }, { status: 400 });
    }

    const data = parsed.data;
    const nikHash = hashNik(data.nik);
    const [skpd, existingUser] = await Promise.all([
      db.sKPD.findUnique({ where: { id: data.skpdId }, select: { id: true } }),
      db.user.findFirst({ where: { OR: [{ nip: data.nip }, { email: data.email }, { nikHash }] }, select: { id: true } }),
    ]);
    if (!skpd) return NextResponse.json({ error: "Instansi tidak ditemukan. Pilih instansi dari daftar." }, { status: 400 });
    if (existingUser) return NextResponse.json({ error: "NIP, NIK, atau email sudah terdaftar sebagai akun SIPINTER." }, { status: 409 });
    const user = await db.user.create({
      data: {
        name: data.name,
        nip: data.nip,
        email: data.email,
        phone: data.phone,
        nikHash,
        rankGroup: data.rankGroup,
        skpdId: data.skpdId,
        position: data.rankGroup,
        role: Role.BORROWER,
        passwordHash: await hashPassword(data.password),
      },
      select: { id: true },
    });
    return NextResponse.json({ userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Pendaftaran SIPINTER gagal", error);
    return NextResponse.json({ error: "Pendaftaran belum dapat diproses. Coba kembali atau hubungi helpdesk." }, { status: 503 });
  }
}
