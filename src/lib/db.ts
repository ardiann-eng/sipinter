import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const configuredUrl = process.env.TURSO_DATABASE_URL;
  const configuredToken = process.env.TURSO_AUTH_TOKEN;
  if (process.env.NODE_ENV === "production" && (!configuredUrl || !configuredToken)) {
    throw new Error("TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN wajib diisi");
  }

  const adapter = new PrismaLibSQL({
    url: configuredUrl ?? "file:prisma/dev.db",
    authToken: configuredToken,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db =
  globalForPrisma.prisma ??
  createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
