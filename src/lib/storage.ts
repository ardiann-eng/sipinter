import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { db } from "./db";
import { WorkflowError, type StoredFile } from "./types";

export interface Storage {
  put(file: File): Promise<StoredFile>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

// Vercel rejects request bodies over 4.5 MB. Keep room for multipart fields.
export const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;
export const MAX_REQUEST_UPLOAD_SIZE = 4 * 1024 * 1024;
const CHUNK_SIZE = 512 * 1024;
const STORAGE_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:pdf|jpg|png)$/i;

const FILE_TYPES = {
  "application/pdf": { extension: ".pdf", matches: (bytes: Buffer) => bytes.subarray(0, 5).equals(Buffer.from("%PDF-")) },
  "image/jpeg": { extension: ".jpg", matches: (bytes: Buffer) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: ".png", matches: (bytes: Buffer) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
} as const;

export function validateUpload(bytes: Buffer, declaredMimeType: string): keyof typeof FILE_TYPES {
  if (!bytes.length) throw new WorkflowError("File kosong");
  if (bytes.length > MAX_UPLOAD_SIZE) throw new WorkflowError("Ukuran file maksimal 4 MB");
  const declared = FILE_TYPES[declaredMimeType as keyof typeof FILE_TYPES];
  if (!declared) throw new WorkflowError("Format file tidak didukung");
  if (!declared.matches(bytes)) throw new WorkflowError("Isi file tidak sesuai MIME type");
  return declaredMimeType as keyof typeof FILE_TYPES;
}

export class LocalStorage implements Storage {
  private readonly root: string;

  constructor(root = process.env.UPLOAD_DIR || "./uploads") {
    this.root = path.resolve(root);
  }

  private resolve(key: string): string {
    if (!STORAGE_KEY.test(key)) {
      throw new Error("Storage key tidak valid");
    }
    const target = path.resolve(this.root, key);
    if (path.dirname(target) !== this.root) throw new Error("Storage key tidak valid");
    return target;
  }

  async put(file: File): Promise<StoredFile> {
    if (file.size > MAX_UPLOAD_SIZE) throw new WorkflowError("Ukuran file maksimal 4 MB");
    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = validateUpload(bytes, file.type);
    const key = `${randomUUID()}${FILE_TYPES[mimeType].extension}`;
    await mkdir(this.root, { recursive: true });
    await writeFile(this.resolve(key), bytes, { flag: "wx" });
    return { key, size: bytes.length, mimeType, originalName: path.basename(file.name) };
  }

  async get(key: string): Promise<Buffer> {
    return readFile(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }
}

export class DatabaseStorage implements Storage {
  constructor(private readonly client: PrismaClient = db) {}

  async put(file: File): Promise<StoredFile> {
    if (file.size > MAX_UPLOAD_SIZE) throw new WorkflowError("Ukuran file maksimal 4 MB");
    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = validateUpload(bytes, file.type);
    const key = `${randomUUID()}${FILE_TYPES[mimeType].extension}`;
    const originalName = path.basename(file.name);
    await this.client.storedUpload.create({ data: { key, originalName, mimeType, size: bytes.length } });
    try {
      for (let index = 0, offset = 0; offset < bytes.length; index++, offset += CHUNK_SIZE) {
        await this.client.storedUploadChunk.create({
          data: { uploadKey: key, index, data: new Uint8Array(bytes.subarray(offset, offset + CHUNK_SIZE)) },
        });
      }
    } catch (error) {
      await this.client.storedUpload.delete({ where: { key } }).catch(() => undefined);
      throw error;
    }
    return { key, size: bytes.length, mimeType, originalName };
  }

  async get(key: string): Promise<Buffer> {
    if (!STORAGE_KEY.test(key)) throw new Error("Storage key tidak valid");
    const upload = await this.client.storedUpload.findUnique({ where: { key }, select: { size: true } });
    if (!upload) throw new Error("Berkas tidak ditemukan");
    const chunks: Buffer[] = [];
    for (let index = 0; index < Math.ceil(upload.size / CHUNK_SIZE); index++) {
      const chunk = await this.client.storedUploadChunk.findUnique({
        where: { uploadKey_index: { uploadKey: key, index } },
        select: { data: true },
      });
      if (!chunk) throw new Error("Berkas tidak lengkap");
      chunks.push(Buffer.from(chunk.data));
    }
    const bytes = Buffer.concat(chunks);
    if (bytes.length !== upload.size) throw new Error("Ukuran berkas tidak sesuai");
    return bytes;
  }

  async delete(key: string): Promise<void> {
    if (!STORAGE_KEY.test(key)) throw new Error("Storage key tidak valid");
    await this.client.storedUpload.deleteMany({ where: { key } });
  }
}

export const storage: Storage = process.env.STORAGE_BACKEND === "database" ||
  (process.env.STORAGE_BACKEND !== "local" && (process.env.VERCEL === "1" || (process.env.NODE_ENV === "production" && Boolean(process.env.TURSO_DATABASE_URL))))
  ? new DatabaseStorage()
  : new LocalStorage();
