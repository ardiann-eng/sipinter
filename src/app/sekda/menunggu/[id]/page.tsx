import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BusFront, Camera, CheckCircle2, FileCheck2, UserRound } from "lucide-react";
import { DecisionPanel } from "@/components/approver";
import { ApprovalLetter } from "@/components/approval-letter";
import { Badge, DetailGrid, DetailItem, DocumentPlaceholder, Panel, Timeline } from "@/components";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toApprovalView } from "@/lib/approval-view";
import { Role } from "@prisma/client";

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole([Role.APPROVER]);
  const request = await db.borrowingRequest.findUnique({ where: { id }, include: { borrower: { include: { skpd: true } }, items: { include: { item: true } }, approvalRecords: true, returnSubmissions: { orderBy: { submittedAt: "desc" }, take: 1, include: { photos: true } } } });
  if (!request) notFound();
  const record = toApprovalView(request);
  const pending = record.status === "MENUNGGU";

  return <div className="sekda-page">
    <Link href={pending ? "/sekda/menunggu" : "/sekda/riwayat"} className="back-link"><ArrowLeft size={16} />Kembali ke {pending ? "antrean" : "riwayat"}</Link>
    <div className="detail-title"><div><span className="page-header__eyebrow">Rincian permohonan</span><h1>{record.number}</h1><p>Diajukan {record.submittedAt}</p></div>{pending ? <Badge tone="maroon" dot>Menunggu keputusan Sekda</Badge> : <Badge tone={record.status === "DISETUJUI" ? "success" : "danger"} dot>{record.status === "DISETUJUI" ? "Disetujui" : "Ditolak"}</Badge>}</div>
    <div className="approval-detail-layout">
      <div className="approval-detail-main">
        <Panel title="Informasi pemohon" action={<UserRound size={20} />}><DetailGrid>
          <DetailItem label="Nama lengkap">{record.requester}</DetailItem><DetailItem label="NIP">{record.nip}</DetailItem><DetailItem label="Unit kerja">{record.unit}</DetailItem><DetailItem label="Perangkat daerah">{record.skpd}</DetailItem>
        </DetailGrid></Panel>
        <Panel title="Keperluan dan jadwal"><DetailGrid>
          <DetailItem label="Tujuan kedinasan" wide>{record.purpose}</DetailItem><DetailItem label="Lokasi kegiatan" wide>{record.location}</DetailItem><DetailItem label="Mulai">{record.startDate}</DetailItem><DetailItem label="Selesai">{record.endDate}</DetailItem><DetailItem label="Durasi">{record.duration}</DetailItem><DetailItem label="Jumlah kendaraan">{record.items.length} kendaraan</DetailItem>
        </DetailGrid></Panel>
        <Panel title="Daftar kendaraan" description="Kapasitas dan ketersediaan telah dikonfirmasi administrator" action={<BusFront size={20} />} flush><div className="requested-items">{record.items.map((item, index) => <div key={item.code}><span>{index + 1}</span><p><strong>{item.name}</strong><small>{item.code}</small></p><b>{item.quantity} {item.unit}</b><Badge tone="success">Tersedia</Badge></div>)}</div></Panel>
        <Panel title="Dokumen pendukung" description="Dokumen diterima bersama pengajuan" action={<FileCheck2 size={20} />}><div className="approval-documents">
          <ApprovalLetter requestId={request.id} signed={Boolean(request.approvedAt)} />
          {request.ktpFile ? <DocumentPlaceholder name="Identitas peminjam" type="document" description="Dokumen identitas yang diunggah pemohon" href={`/api/uploads/${encodeURIComponent(request.ktpFile)}`} /> : <p>Dokumen identitas tidak tersedia.</p>}
          {request.approvalLetterFile ? <DocumentPlaceholder name="Surat tugas / dokumen pendukung" type="document" description="Dokumen kedinasan yang diunggah pemohon" href={`/api/uploads/${encodeURIComponent(request.approvalLetterFile)}`} /> : <p>Surat tugas tidak tersedia.</p>}
        </div></Panel>
        {request.returnSubmissions[0] && <Panel title="Bukti pengembalian" description="Foto yang dikirim peminjam saat pengembalian"><div className="return-evidence">{request.returnSubmissions[0].photos.length ? request.returnSubmissions[0].photos.map((photo) => <a key={photo.id} href={`/api/uploads/${encodeURIComponent(photo.storageKey ?? photo.fileUrl)}`} target="_blank" rel="noreferrer"><span className="return-evidence__preview" style={{ backgroundImage: `url(/api/uploads/${encodeURIComponent(photo.storageKey ?? photo.fileUrl)})` }} /><span><Camera size={17} aria-hidden="true" />{photo.originalName || "Lihat foto bukti"}</span></a>) : <p>Peminjam tidak menambahkan foto bukti.</p>}</div></Panel>}
        <Panel title="Catatan verifikasi administrator" action={<CheckCircle2 size={20} />}><div className="verification-note"><Badge tone="success" dot>Lengkap dan layak diteruskan</Badge><p>{record.adminNote}</p><footer><strong>{record.admin}</strong><span>Administrator SIPINTER</span><time>{record.verifiedAt}</time></footer></div></Panel>
        <Panel title="Riwayat proses"><Timeline items={[
          { id: "1", title: "Permohonan diajukan", description: `${record.requester} mengirim permohonan beserta dokumen pendukung.`, timestamp: record.submittedAt, state: "complete" },
          { id: "2", title: "Verifikasi administrator selesai", description: `${record.admin} menyatakan dokumen lengkap dan kendaraan tersedia.`, timestamp: record.verifiedAt, state: "complete" },
          { id: "3", title: pending ? "Menunggu keputusan Sekretaris Daerah" : `Permohonan ${record.status === "DISETUJUI" ? "disetujui" : "ditolak"}`, description: pending ? "Permohonan berada pada meja persetujuan Sekretaris Daerah." : record.decisionNote, timestamp: record.decidedAt ?? "Saat ini", state: pending ? "current" : "complete" },
        ]} /></Panel>
      </div>
       <div className="approval-detail-side"><DecisionPanel requestId={record.id} disabled={!pending} />{!pending && <Panel title="Catatan keputusan"><p className="decision-note">{record.decisionNote}</p><small>{record.decidedAt}</small></Panel>}<aside className="policy-note"><strong>Dasar penelaahan</strong><p>Penggunaan kendaraan wajib mendukung tugas kedinasan, sesuai kapasitas penumpang, tersedia pada jadwal dimohonkan, dan memenuhi prinsip tertib pengelolaan kendaraan dinas.</p></aside></div>
    </div>
  </div>;
}
