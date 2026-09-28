import { describe, expect, it } from "vitest";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseStorage, MAX_UPLOAD_SIZE, validateUpload } from "../src/lib/storage";

describe("validasi storage", () => {
  it("menerima magic bytes PDF, JPEG, dan PNG yang sesuai MIME", () => {
    expect(validateUpload(Buffer.from("%PDF-1.7"), "application/pdf")).toBe("application/pdf");
    expect(validateUpload(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg")).toBe("image/jpeg");
    expect(validateUpload(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png")).toBe("image/png");
  });

  it("menolak MIME palsu, format lain, dan file lebih dari 4 MB", () => {
    expect(() => validateUpload(Buffer.from("not a pdf"), "application/pdf")).toThrow("MIME");
    expect(() => validateUpload(Buffer.from("GIF89a"), "image/gif")).toThrow("tidak didukung");
    const oversized = Buffer.alloc(MAX_UPLOAD_SIZE + 1);
    oversized.write("%PDF-");
    expect(() => validateUpload(oversized, "application/pdf")).toThrow("4 MB");
  });
});

describe("penyimpanan lampiran Turso/libSQL", () => {
  it("menyimpan, membaca, dan menghapus berkas yang terbagi menjadi beberapa chunk", async () => {
    const client = new PrismaClient({ adapter: new PrismaLibSQL({ url: "file::memory:" }) });
    try {
      const migration = await readFile(path.resolve("prisma/migrations/20260928060000_add_stored_uploads/migration.sql"), "utf8");
      for (const statement of migration.split(";").map((part) => part.trim()).filter(Boolean)) {
        await client.$executeRawUnsafe(statement);
      }
      const storage = new DatabaseStorage(client);
      const bytes = Buffer.alloc(600 * 1024, 65);
      bytes.write("%PDF-");
      const saved = await storage.put(new File([bytes], "bukti.pdf", { type: "application/pdf" }));
      expect(saved.key).toMatch(/\.pdf$/);
      expect(await storage.get(saved.key)).toEqual(bytes);
      expect(await client.storedUploadChunk.count({ where: { uploadKey: saved.key } })).toBe(2);
      await storage.delete(saved.key);
      await expect(storage.get(saved.key)).rejects.toThrow("Berkas tidak ditemukan");
    } finally {
      await client.$disconnect();
    }
  });
});
