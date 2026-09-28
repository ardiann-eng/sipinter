import { readFile } from "node:fs/promises";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { ApprovalDecision, BorrowingStatus, type Prisma } from "@prisma/client";

export type ApprovalLetterRequest = Prisma.BorrowingRequestGetPayload<{
  include: {
    borrower: { include: { skpd: true } };
    items: { include: { item: true } };
    approvalRecords: { include: { approver: true } };
  };
}>;

const templatePath = path.join(process.cwd(), "src", "assets", "approval-letter-template.docx");
const signaturePath = path.join(process.cwd(), "src", "assets", "sekda-signature.png");
const signedStatuses: BorrowingStatus[] = [
  BorrowingStatus.APPROVED,
  BorrowingStatus.READY_FOR_HANDOVER,
  BorrowingStatus.BORROWED,
  BorrowingStatus.WAITING_RETURN,
  BorrowingStatus.WAITING_RETURN_VERIFICATION,
  BorrowingStatus.RETURN_PROBLEM,
  BorrowingStatus.COMPLETED,
  BorrowingStatus.OVERDUE,
];

export function hasSekdaApproval(request: ApprovalLetterRequest): boolean {
  return signedStatuses.includes(request.status) && request.approvalRecords.some((record) => record.decision === ApprovalDecision.APPROVED);
}

function indonesianDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(date);
}

function condition(value: string): string {
  return ({ GOOD: "Baik", LIGHTLY_DAMAGED: "Rusak ringan", HEAVILY_DAMAGED: "Rusak berat", LOST: "Hilang" } as Record<string, string>)[value] ?? value;
}

function embedSignature(bytes: Uint8Array, signature: Buffer): Uint8Array {
  const zip = new PizZip(bytes);
  const document = zip.file("word/document.xml")?.asText();
  const relationships = zip.file("word/_rels/document.xml.rels")?.asText();
  const contentTypes = zip.file("[Content_Types].xml")?.asText();
  if (!document || !relationships || !contentTypes) throw new Error("Template surat tidak lengkap");

  const relationshipId = "rIdSekdaSignature";
  const drawing = `<w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="1143000" cy="1143000"/><wp:docPr id="9001" name="TTD QR Sekda"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="TTD QR Sekda.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${relationshipId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1143000" cy="1143000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`;
  if (!document.includes("__SEKDA_SIGNATURE__")) throw new Error("Posisi TTD tidak ditemukan pada template");
  zip.file("word/document.xml", document.replace(/<w:t(?:\s[^>]*)?>__SEKDA_SIGNATURE__<\/w:t>/, drawing));
  zip.file("word/_rels/document.xml.rels", relationships.replace("</Relationships>", `<Relationship Id="${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/sekda-signature.png"/></Relationships>`));
  zip.file("[Content_Types].xml", contentTypes.includes('Extension="png"') ? contentTypes : contentTypes.replace("</Types>", '<Default Extension="png" ContentType="image/png"/></Types>'));
  zip.file("word/media/sekda-signature.png", signature);
  return zip.generate({ type: "uint8array", compression: "DEFLATE" });
}

export async function createApprovalLetter(request: ApprovalLetterRequest): Promise<Uint8Array> {
  const approval = request.approvalRecords
    .filter((record) => record.decision === ApprovalDecision.APPROVED)
    .sort((a, b) => b.decidedAt.getTime() - a.decidedAt.getTime())[0];
  const signed = hasSekdaApproval(request);
  const template = await readFile(templatePath);
  const doc = new Docxtemplater(new PizZip(template), { paragraphLoop: true, linebreaks: true, nullGetter: () => "" });
  doc.render({
    letterTitle: signed ? "SURAT PERSETUJUAN PEMINJAMAN BARANG INVENTARIS" : "DRAF SURAT PERSETUJUAN PEMINJAMAN BARANG INVENTARIS",
    registrationNumber: request.registrationNumber,
    decisionIntro: signed
      ? "Dengan ini menyatakan MENYETUJUI permohonan peminjaman barang inventaris kantor yang diajukan melalui aplikasi SIPINTER oleh:"
      : "Berikut adalah data permohonan peminjaman barang inventaris yang menunggu persetujuan Sekda:",
    borrowerName: request.borrower.name,
    borrowerNip: request.borrower.nip,
    borrowerPosition: request.borrower.position,
    borrowerSkpd: request.borrower.skpd.name,
    itemSummary: request.items.map((entry, index) => `${index + 1}. ${entry.item.name} — kode ${entry.item.registrationNumber ?? entry.item.itemCode}; ${entry.quantity} ${entry.item.unit}; kondisi awal ${condition(entry.initialCondition)}`).join("\n"),
    borrowDate: indonesianDate(request.borrowDate),
    returnDate: indonesianDate(request.plannedReturnDate),
    purpose: request.purpose,
    activityLocation: request.activityLocation,
    validityText: signed
      ? "Surat persetujuan ini diterbitkan melalui aplikasi SIPINTER setelah keputusan Sekda dicatat."
      : "DRAF — surat ini belum disetujui dan belum berlaku sebagai surat persetujuan.",
    decisionDate: signed && approval ? indonesianDate(approval.decidedAt) : "Menunggu persetujuan",
    decisionHeading: signed ? "Menyetujui," : "Menunggu persetujuan,",
    signatureMarker: signed ? "__SEKDA_SIGNATURE__" : "Dokumen ini belum ditandatangani.",
  });
  const rendered = doc.getZip().generate({ type: "uint8array", compression: "DEFLATE" });
  return signed ? embedSignature(rendered, await readFile(signaturePath)) : rendered;
}
