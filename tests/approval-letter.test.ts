import { describe, expect, it } from "vitest";
import PizZip from "pizzip";
import { BorrowingStatus, ApprovalDecision } from "@prisma/client";
import { createApprovalLetter, type ApprovalLetterRequest } from "../src/lib/approval-letter";

const base = {
  registrationNumber: "SIPINTER-TEST-001",
  status: BorrowingStatus.WAITING_SEKDA_APPROVAL,
  purpose: "Kegiatan koordinasi pelayanan publik",
  activityLocation: "Makassar",
  borrowDate: new Date("2026-10-01T00:00:00.000Z"),
  plannedReturnDate: new Date("2026-10-02T00:00:00.000Z"),
  borrower: { name: "Andi Pemohon", nip: "123456789", position: "Analis", skpd: { name: "Bagian Umum" } },
  items: [
    { quantity: 1, initialCondition: "GOOD", item: { name: "Proyektor", itemCode: "INV-01", registrationNumber: null, unit: "unit" } },
    { quantity: 2, initialCondition: "GOOD", item: { name: "Laptop", itemCode: "INV-02", registrationNumber: null, unit: "unit" } },
  ],
  approvalRecords: [],
};

describe("surat persetujuan", () => {
  it("mengisi draf tanpa gambar TTD", async () => {
    const bytes = await createApprovalLetter(base as unknown as ApprovalLetterRequest);
    const zip = new PizZip(bytes);
    const document = zip.file("word/document.xml")!.asText();
    expect(document).toContain("Andi Pemohon");
    expect(document).toContain("DR. A. ZULKIFLY NANDA");
    expect(document).toContain("198006301998101002");
    expect(document).not.toContain("Menunggu keputusan Sekda");
    expect(document).toContain("Proyektor");
    expect(document).toContain("Laptop");
    expect(document).toContain("belum disetujui");
    expect(zip.file("word/media/sekda-signature.png")).toBeNull();
  });

  it("menempelkan TTD QR setelah persetujuan Sekda", async () => {
    const request = {
      ...base,
      status: BorrowingStatus.APPROVED,
      approvalRecords: [{ decision: ApprovalDecision.APPROVED, decidedAt: new Date("2026-09-27T03:00:00.000Z"), approver: { name: "Sekda Penguji", nip: "987654321", position: "Sekretaris Daerah" } }],
    } as unknown as ApprovalLetterRequest;
    const zip = new PizZip(await createApprovalLetter(request));
    const document = zip.file("word/document.xml")!.asText();
    expect(document).toContain("DR. A. ZULKIFLY NANDA");
    expect(document).toContain("198006301998101002");
    expect(document).toContain("rIdSekdaSignature");
    expect(document).not.toContain("__SEKDA_SIGNATURE__");
    expect(zip.file("word/media/sekda-signature.png")).not.toBeNull();
  });
});
