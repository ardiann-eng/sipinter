import { jwtVerify, type JWTPayload } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "sipinter_session";
const ROLES = ["ADMIN", "BORROWER", "APPROVER"] as const;
type Role = (typeof ROLES)[number];

const roleRoutes: Record<Role, string> = {
  ADMIN: "/admin",
  BORROWER: "/peminjam",
  APPROVER: "/sekda",
};

function routeRole(pathname: string): Role | null {
  for (const [role, prefix] of Object.entries(roleRoutes) as [Role, string][]) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

async function verifiedPayload(token: string): Promise<JWTPayload | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return payload.sub && isRole(payload.role) ? payload : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifiedPayload(token) : null;
  const role = payload?.role as Role | undefined;
  const requiredRole = routeRole(pathname);
  const sharedRoute = pathname === "/notifikasi" || pathname === "/profil";

  if (pathname === "/login" || pathname === "/daftar") {
    if (!role) return NextResponse.next();
    return NextResponse.redirect(new URL(roleRoutes[role], request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(role ? roleRoutes[role] : "/login", request.url));
  }

  if (requiredRole || sharedRoute) {
    if (!payload) {
      const destination = token ? "/sesi-berakhir" : "/login";
      const url = new URL(destination, request.url);
      if (!token) url.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
      const response = NextResponse.redirect(url);
      if (token) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    if (requiredRole && role !== requiredRole) {
      return NextResponse.redirect(new URL("/akses-ditolak", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/daftar",
    "/admin/:path*",
    "/peminjam/:path*",
    "/sekda/:path*",
    "/notifikasi",
    "/profil",
  ],
};
