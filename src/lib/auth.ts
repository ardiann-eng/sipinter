import "server-only";

import { Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { assertRole } from "./authorization";
import { AuthenticationError, type SessionUser } from "./types";

export const SESSION_COOKIE = "sipinter_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET wajib berisi minimal 32 karakter");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    skpdId: user.skpdId,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionUser> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
    });
    if (
      !payload.sub ||
      typeof payload.skpdId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      !Object.values(Role).includes(payload.role as Role)
    ) {
      throw new AuthenticationError("Sesi tidak valid");
    }
    return {
      id: payload.sub,
      skpdId: payload.skpdId,
      name: payload.name,
      email: payload.email,
      role: payload.role as Role,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw new AuthenticationError("Sesi tidak valid atau kedaluwarsa");
  }
}

export async function authenticate(
  identifier: string,
  password: string,
): Promise<SessionUser | null> {
  const normalized = identifier.trim().toLowerCase();
  const user = await db.user.findFirst({
    where: { OR: [{ email: normalized }, { nip: identifier.trim() }] },
  });
  if (
    !user ||
    user.status !== UserStatus.ACTIVE ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    return null;
  }
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return {
    id: user.id,
    skpdId: user.skpdId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function setSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new AuthenticationError();

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { status: true, role: true, skpdId: true },
  });
  if (
    !user ||
    user.status !== UserStatus.ACTIVE ||
    user.role !== session.role ||
    user.skpdId !== session.skpdId
  ) {
    throw new AuthenticationError("Sesi tidak lagi berlaku");
  }
  return session;
}

export async function requireRole(roles: readonly Role[]): Promise<SessionUser> {
  const user = await requireUser();
  assertRole(user, roles);
  return user;
}
