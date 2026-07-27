import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoredFile } from "./types";

export interface Storage {
  put(file: File): Promise<StoredFile>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const FILE_TYPES = {
  "application/pdf": { extension: ".pdf", matches: (bytes: Buffer) => bytes.subarray(0, 5).equals(Buffer.from("%PDF-")) },
  "image/jpeg": { extension: ".jpg", matches: (bytes: Buffer) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: ".png", matches: (bytes: Buffer) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
} as const;

export function validateUpload(bytes: Buffer, declaredMimeType: string): keyof typeof FILE_TYPES {
  if (!bytes.length) throw new Error("File kosong");
  if (bytes.length > MAX_UPLOAD_SIZE) throw new Error("Ukuran file maksimal 5 MB");
  const declared = FILE_TYPES[declaredMimeType as keyof typeof FILE_TYPES];
  if (!declared) throw new Error("Format file tidak didukung");
  if (!declared.matches(bytes)) throw new Error("Isi file tidak sesuai MIME type");
  return declaredMimeType as keyof typeof FILE_TYPES;
}

export class LocalStorage implements Storage {
  private readonly root: string;

  constructor(root = process.env.UPLOAD_DIR || "./uploads") {
    this.root = path.resolve(root);
  }

  private resolve(key: string): string {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:pdf|jpg|png)$/i.test(key)) {
      throw new Error("Storage key tidak valid");
    }
    const target = path.resolve(this.root, key);
    if (path.dirname(target) !== this.root) throw new Error("Storage key tidak valid");
    return target;
  }

  async put(file: File): Promise<StoredFile> {
    if (file.size > MAX_UPLOAD_SIZE) throw new Error("Ukuran file maksimal 5 MB");
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

export const storage: Storage = new LocalStorage();
