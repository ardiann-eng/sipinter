import { NextRequest, NextResponse } from "next/server";
import { authenticate, setSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roleHome = {
  ADMIN: "/admin",
  BORROWER: "/peminjam",
  APPROVER: "/sekda",
} as const;

function safeCallback(value: unknown, origin: string): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.includes("\\")) return null;
  try {
    const url = new URL(value, origin);
    return url.origin === origin && !url.username && !url.password
      ? `${url.pathname}${url.search}${url.hash}`
      : null;
  } catch {
    return null;
  }
}

function isWithin(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!identifier || !password) {
      return NextResponse.json({ error: "NIP/email dan kata sandi wajib diisi." }, { status: 400 });
    }

    const user = await authenticate(identifier, password);
    if (!user) {
      return NextResponse.json({ error: "NIP/email atau kata sandi tidak sesuai." }, { status: 401 });
    }
    await setSession(user);

    const callback = safeCallback(body.callbackUrl, request.nextUrl.origin);
    const allowedCallback = callback && (!isWithin(callback, "/admin") || user.role === "ADMIN")
      && (!isWithin(callback, "/peminjam") || user.role === "BORROWER")
      && (!isWithin(callback, "/sekda") || user.role === "APPROVER");
    return NextResponse.json({ redirectTo: allowedCallback ? callback : roleHome[user.role] });
  } catch (error) {
    console.error("Login SIPINTER gagal", error);
    return NextResponse.json(
      { error: "Layanan autentikasi belum tersedia. Hubungi helpdesk bila masalah berlanjut." },
      { status: 503 },
    );
  }
}
