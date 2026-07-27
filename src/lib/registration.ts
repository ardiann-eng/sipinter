import "server-only";

import { createHash } from "crypto";

function registrationKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET wajib berisi minimal 32 karakter");
  return createHash("sha256").update(`${secret}:registration-data`).digest();
}

export function hashNik(nik: string): string {
  return createHash("sha256").update(`${registrationKey().toString("hex")}:${nik}`).digest("hex");
}
