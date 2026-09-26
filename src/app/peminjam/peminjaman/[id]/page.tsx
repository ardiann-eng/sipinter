import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText } from "lucide-react";
import { BorrowingStatus, Role } from "@prisma/client";
import { Badge, DetailGrid, DetailItem, NotFoundState, PageHeader, Panel, Timeline } from "@/components";
import { StatusBadge } from "@/components/borrower/borrower-ui";
import { ApprovalLetter } from "@/components/approval-letter";
import styles from "@/components/borrower/borrower.module.css";
import { requireRole } from "@/lib/auth";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";

export default async function BorrowingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { id }] = await Promise.all([requireRole([Role.BORROWER]), params]);
  const record = await db.borrowingRequest.findFirst({
    where: { id, borrowerId: user.id },
    include: {
      borrower: { include: { skpd: true } },
      items: { include: { item: true } },
      approvalRecords: { include: { approver: true }, orderBy: { decidedAt: "desc" } },
      handoverRecord: true,
      returnSubmissions: { orderBy: { submittedAt: "desc" }, take: 1 },
    },
  });
  if (!record) return <div className={styles.page}><Link className={`${styles.linkButton} ${styles.linkGhost}`} href="/peminjam/peminjaman"><ArrowLeft size={16} aria-hidden="true" /> Kembali</Link><NotFoundState description="Data peminjaman tidak ditemukan atau bukan milik akun ini." /></div>;

  const request = toBorrowerRequest(record);
  const revision = record.status === BorrowingStatus.REVISION_REQUIRED;
  const returnableStatuses: BorrowingStatus[] = [BorrowingStatus.BORROWED, BorrowingStatus.OVERDUE, BorrowingStatus.WAITING_RETURN_VERIFICATION, BorrowingStatus.RETURN_PROBLEM];
  const returnable = returnableStatuses.includes(record.status);
  const nextAction = revision
    ? { title: "Perbaikan dokumen diperlukan", description: record.adminNote || "Periksa kembali dokumen pengajuan sebelum dikirim ulang.", label: "Perbaiki pengajuan", href: `/peminjam/ajukan?revision=${record.id}` }
    : returnable
      ? { title: record.status === BorrowingStatus.WAITING_RETURN_VERIFICATION ? "Pengembalian sedang diperiksa" : record.status === BorrowingStatus.RETURN_PROBLEM ? "Pengembalian memerlukan tindak lanjut" : "Kendaraan perlu dikembalikan", description: record.adminNote || `Batas pengembalian ${formatDate(record.plannedReturnDate)}.`, label: "Buka pengembalian", href: `/peminjam/pengembalian/${record.id}` }
      : { title: record.status === BorrowingStatus.COMPLETED ? "Peminjaman telah selesai" : record.status === BorrowingStatus.READY_FOR_HANDOVER ? "Kendaraan siap diserahkan" : "Pengajuan sedang diproses", description: record.status === BorrowingStatus.READY_FOR_HANDOVER ? "Tunggu informasi jadwal pengambilan dari pengelola kendaraan." : "Status akan diperbarui setelah tahapan berikutnya selesai." };

  const timeline = [
    { id: "submitted", title: "Pengajuan dikirim", timestamp: formatDateTime(record.submittedAt ?? record.createdAt), state: "complete" as const },
    { id: "admin", title: "Verifikasi administrator", timestamp: record.verifiedAt ? formatDateTime(record.verifiedAt) : revision ? "Perlu revisi" : "Menunggu", state: record.verifiedAt ? "complete" as const : "current" as const },
    { id: "approval", title: "Persetujuan Sekda", timestamp: record.approvedAt ? formatDateTime(record.approvedAt) : record.rejectedAt ? "Ditolak" : "Menunggu", state: record.approvedAt || record.rejectedAt ? "complete" as const : "upcoming" as const },
    ...(record.handedOverAt ? [{ id: "handover", title: "Kendaraan diserahkan", timestamp: formatDateTime(record.handedOverAt), state: "complete" as const }] : []),
    ...(record.returnedAt ? [{ id: "returned", title: "Pengembalian diajukan", timestamp: formatDateTime(record.returnedAt), state: record.completedAt ? "complete" as const : "current" as const }] : []),
    ...(record.completedAt ? [{ id: "completed", title: "Pengembalian selesai", timestamp: formatDateTime(record.completedAt), state: "complete" as const }] : []),
  ];

  return <div className={styles.page}>
    <PageHeader eyebrow="Detail peminjaman" title={record.registrationNumber} description={`Diajukan ${formatDateTime(record.submittedAt ?? record.createdAt)} WITA`} actions={<Link className={`${styles.linkButton} ${styles.linkOutline}`} href="/peminjam/peminjaman"><ArrowLeft size={16} aria-hidden="true" /> Kembali</Link>} />
    <section className={styles.statusHero} aria-label="Status dan tindakan peminjaman"><div><span>STATUS SAAT INI</span><h2>{nextAction.title}</h2><p>{nextAction.description}</p></div><div className={styles.statusHeroAction}><StatusBadge status={request.status} />{"href" in nextAction && nextAction.href && <Link className={`${styles.linkButton} ${styles.linkSecondary}`} href={nextAction.href}>{nextAction.label}</Link>}</div></section>
    <div className={styles.grid}>
      <Panel className={styles.span8}><div className={styles.detailHero}><div><h2>{record.purpose}</h2><p className={styles.muted}>{record.activityLocation}</p></div><StatusBadge status={request.status} /></div><DetailGrid><DetailItem label="Peminjam">{record.borrower.name}</DetailItem><DetailItem label="NIP">{record.borrower.nip}</DetailItem><DetailItem label="Perangkat daerah">{record.borrower.skpd.name}</DetailItem><DetailItem label="Unit kerja">{record.borrower.position}</DetailItem><DetailItem label="Mulai">{formatDate(record.borrowDate)}</DetailItem><DetailItem label="Selesai">{formatDate(record.plannedReturnDate)}</DetailItem><DetailItem label="Keperluan" wide>{record.purpose}</DetailItem><DetailItem label="Lokasi kegiatan" wide>{record.activityLocation}</DetailItem></DetailGrid></Panel>
      <Panel className={styles.span4} title="Alur peminjaman"><Timeline items={timeline} /></Panel>
      <Panel className={styles.span8} title="Kendaraan dipinjam" description={`${record.items.length} kendaraan`}><div className={styles.itemRows}>{record.items.map((entry) => <div className={styles.itemRow} key={entry.id}>{entry.item.mainPhoto && <span className={styles.itemRowImage}><Image src={entry.item.mainPhoto} alt="" fill sizes="72px" /></span>}<div><strong>{entry.item.name}</strong><small>{entry.item.registrationNumber ?? entry.item.itemCode}</small></div><Badge tone="info">{entry.quantity} kendaraan</Badge></div>)}</div></Panel>
      <Panel className={styles.span4} title="Dokumen pengajuan"><div className={styles.available}><ApprovalLetter requestId={record.id} signed={Boolean(record.approvedAt)} />{record.ktpFile && <a className={styles.availableItem} href={`/api/uploads/${encodeURIComponent(record.ktpFile)}`} target="_blank" rel="noreferrer"><span className={styles.itemIcon}><FileText size={18} aria-hidden="true" /></span><div><strong>Kartu Tanda Penduduk</strong><small>Buka dokumen</small></div></a>}{record.approvalLetterFile && <a className={styles.availableItem} href={`/api/uploads/${encodeURIComponent(record.approvalLetterFile)}`} target="_blank" rel="noreferrer"><span className={styles.itemIcon}><FileText size={18} aria-hidden="true" /></span><div><strong>Surat tugas</strong><small>Buka dokumen</small></div></a>}</div></Panel>
    </div>
  </div>;
}
