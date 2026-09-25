import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BorrowingStatus, Role } from "@prisma/client";
import { Badge, DetailGrid, DetailItem, NotFoundState, PageHeader, Panel } from "@/components";
import { ReturnForm } from "@/components/borrower/return-form";
import styles from "@/components/borrower/borrower.module.css";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

const visibleStatuses: BorrowingStatus[] = [
  BorrowingStatus.BORROWED,
  BorrowingStatus.OVERDUE,
  BorrowingStatus.WAITING_RETURN_VERIFICATION,
  BorrowingStatus.RETURN_PROBLEM,
];

export default async function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { id }] = await Promise.all([requireRole([Role.BORROWER]), params]);
  const request = await db.borrowingRequest.findFirst({
    where: { id, borrowerId: user.id, status: { in: visibleStatuses } },
    include: { items: { include: { item: true } }, returnSubmissions: { orderBy: { submittedAt: "desc" }, take: 1 } },
  });
  if (!request) return <div className={styles.page}><Link className={`${styles.linkButton} ${styles.linkGhost}`} href="/peminjam/pengembalian"><ArrowLeft size={16} aria-hidden="true" /> Kembali</Link><NotFoundState description="Peminjaman tidak ditemukan atau belum dapat dikembalikan." /></div>;
  const canSubmit = request.status === BorrowingStatus.BORROWED || request.status === BorrowingStatus.OVERDUE;
  return <div className={styles.page}>
    <PageHeader eyebrow="Pengajuan pengembalian kendaraan" title={request.registrationNumber} description="Dokumentasikan kondisi eksterior, interior, dan nomor polisi setiap kendaraan sebelum dikirim." actions={<Link className={`${styles.linkButton} ${styles.linkOutline}`} href="/peminjam/pengembalian"><ArrowLeft size={16} aria-hidden="true" /> Kembali</Link>} />
    <Panel title="Ringkasan peminjaman">
      <DetailGrid><DetailItem label="Keperluan" wide>{request.purpose}</DetailItem><DetailItem label="Periode">{formatDate(request.borrowDate)} - {formatDate(request.plannedReturnDate)}</DetailItem><DetailItem label="Lokasi">{request.activityLocation}</DetailItem><DetailItem label="Kendaraan" wide><div className={styles.itemRows}>{request.items.map((entry) => <div className={styles.itemRow} key={entry.id}><strong>{entry.item.name} · {entry.item.registrationNumber ?? entry.item.itemCode}</strong><Badge tone="info">{entry.quantity} {entry.item.unit}</Badge></div>)}</div></DetailItem></DetailGrid>
    </Panel>
    {canSubmit ? <ReturnForm requestId={request.id} number={request.registrationNumber} itemCount={request.items.length} borrowDate={request.borrowDate.toISOString().slice(0, 10)} /> : <Panel title={request.status === BorrowingStatus.RETURN_PROBLEM ? "Pengembalian memerlukan tindak lanjut" : "Menunggu pemeriksaan petugas"} description={request.status === BorrowingStatus.RETURN_PROBLEM ? "Hubungi pengelola kendaraan dan ikuti catatan pemeriksaan sebelum proses diselesaikan." : "Bukti pengembalian telah diterima sistem dan sedang diperiksa administrator."}><p>{request.adminNote || request.returnSubmissions[0]?.notes || "Tidak ada catatan tambahan."}</p></Panel>}
  </div>;
}
