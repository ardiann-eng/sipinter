import { notFound } from "next/navigation";
import { DocumentPlaceholder, Panel, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components";
import { AdminHeader, Status, s } from "@/components/admin/admin-ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { BorrowingStatus, Role } from "@prisma/client";
import { VerificationActions } from "./verification-actions";

export default async function VerificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole([Role.ADMIN]);
  const { id } = await params;
  const request = await db.borrowingRequest.findUnique({ where: { id }, include: { borrower: { include: { skpd: true } }, items: { include: { item: true } } } });
  if (!request) notFound();
  const actionable = request.status === BorrowingStatus.WAITING_ADMIN_VERIFICATION;
  return <><AdminHeader title="Pemeriksaan permohonan" description={request.registrationNumber} actions={<Status value={request.status} />} /><div className={s.grid7030}>
    <div className={s.stack}>
      <Panel title="Identitas dan kegiatan"><dl className="detail-grid"><div className="detail-item"><dt>Pemohon</dt><dd>{request.borrower.name}</dd></div><div className="detail-item"><dt>NIP</dt><dd>{request.borrower.nip}</dd></div><div className="detail-item"><dt>Perangkat daerah</dt><dd>{request.borrower.skpd.name}</dd></div><div className="detail-item"><dt>Unit kerja</dt><dd>{request.borrower.position}</dd></div><div className="detail-item"><dt>Periode</dt><dd>{formatDate(request.borrowDate)} – {formatDate(request.plannedReturnDate)}</dd></div><div className="detail-item detail-item--wide"><dt>Keperluan</dt><dd>{request.purpose}</dd></div><div className="detail-item detail-item--wide"><dt>Lokasi</dt><dd>{request.activityLocation}</dd></div></dl></Panel>
      <Panel title="Barang yang dimohon" flush><TableContainer><Table><TableHead><TableRow><TableHeader>Barang</TableHeader><TableHeader>Jumlah</TableHeader><TableHeader>Stok tersedia</TableHeader></TableRow></TableHead><TableBody>{request.items.map((entry) => <TableRow key={entry.id}><TableCell><strong>{entry.item.name}</strong><small>{entry.item.itemCode}</small></TableCell><TableCell>{entry.quantity} {entry.item.unit}</TableCell><TableCell>{entry.item.availableQuantity} {entry.item.unit}</TableCell></TableRow>)}</TableBody></Table></TableContainer></Panel>
      <Panel title="Dokumen pendukung" description="Dokumen tersimpan pada penyimpanan privat."><div className={s.stack}><DocumentPlaceholder name="Kartu Tanda Penduduk" type="document" description={request.ktpFile ? "Dokumen tersedia" : "Dokumen tidak tersedia"} /><DocumentPlaceholder name="Surat tugas / dokumen pendukung" type="document" description={request.approvalLetterFile ? "Dokumen tersedia" : "Dokumen tidak tersedia"} /></div></Panel>
    </div>
    <aside className={s.stack}><Panel title="Checklist verifikator" description="Pastikan seluruh butir telah diperiksa sebelum meneruskan."><div className={s.checklist}>{["Identitas dan NIP pemohon sesuai", "Surat permohonan sah dan terbaca", "Tujuan penggunaan bersifat kedinasan", "Jadwal tidak bertabrakan", "Jumlah sesuai kebutuhan kegiatan", "Stok fisik telah dikonfirmasi"].map((label) => <label className={s.check} key={label}><input type="checkbox" /> <span>{label}</span></label>)}</div></Panel><Panel title="Catatan keputusan">{actionable ? <VerificationActions requestId={request.id} /> : <p>Permohonan sudah diproses pada {formatDateTime(request.updatedAt)} WITA.</p>}</Panel></aside>
  </div></>;
}
