import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_SIZE, validateUpload } from "../src/lib/storage";

describe("validasi storage", () => {
  it("menerima magic bytes PDF, JPEG, dan PNG yang sesuai MIME", () => {
    expect(validateUpload(Buffer.from("%PDF-1.7"), "application/pdf")).toBe("application/pdf");
    expect(validateUpload(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg")).toBe("image/jpeg");
    expect(validateUpload(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png")).toBe("image/png");
  });

  it("menolak MIME palsu, format lain, dan file lebih dari 5 MB", () => {
    expect(() => validateUpload(Buffer.from("not a pdf"), "application/pdf")).toThrow("MIME");
    expect(() => validateUpload(Buffer.from("GIF89a"), "image/gif")).toThrow("tidak didukung");
    const oversized = Buffer.alloc(MAX_UPLOAD_SIZE + 1);
    oversized.write("%PDF-");
    expect(() => validateUpload(oversized, "application/pdf")).toThrow("5 MB");
  });
});
