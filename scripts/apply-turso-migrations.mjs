import { createClient } from "@libsql/client";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  throw new Error("TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN wajib diisi");
}

const migrationsDir = path.resolve("prisma", "migrations");
const entries = (await readdir(migrationsDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));
const client = createClient({ url, authToken });

try {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_sipinter_migrations" (
      "name" TEXT NOT NULL PRIMARY KEY,
      "appliedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  for (const entry of entries) {
    const applied = await client.execute({
      sql: 'SELECT "name" FROM "_sipinter_migrations" WHERE "name" = ?',
      args: [entry.name],
    });
    if (applied.rows.length) {
      console.info(`Migration dilewati: ${entry.name}`);
      continue;
    }
    const sql = await readFile(path.join(migrationsDir, entry.name, "migration.sql"), "utf8");
    const statements = sql
      .split(/;\s*(?:\r?\n|$)/)
      .map((statement) => statement.trim())
      .filter(Boolean);
    if (statements.length) {
      await client.batch([
        ...statements.map((statement) => ({ sql: statement, args: [] })),
        {
          sql: 'INSERT INTO "_sipinter_migrations" ("name") VALUES (?)',
          args: [entry.name],
        },
      ], "write");
      console.info(`Migration diterapkan: ${entry.name}`);
    }
  }
} finally {
  client.close();
}
