import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge, DetailGrid, DetailItem, NotFoundState, PageHeader, Panel } from "@/components";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Role } from "@prisma/client";
import { ReturnForm } from "@/components/borrower/return-form";
import styles from "@/components/borrower/borrower.module.css";

export default async function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole([Role.BORROWER]);
  const { id } = await params;
  const request = await db.borrowingRequest.findFirst({ where: { id, borrowerId: user.id, status: { in: ["BORROWED", "WAITING_RETURN", "OVERDUE", "RETURN_PROBLEM"] } }, include: { items: { include: { item: true } } } });
  if (!request) return <div className={styles.page}><Link className={`${styles.linkButton} ${styles.linkGhost}`} href="/peminjam/pengembalian"><ArrowLeft size={16} /> Kembali</Link><NotFoundState description="Peminjaman tidak ditemukan atau belum dapat dikembalikan." /></div>;
  return <div className={styles.page}><PageHeader eyebrow="Pengajuan pengembalian kendaraan" title={request.registrationNumber} description="Dokumentasikan kondisi eksterior, interior, dan nomor polisi setiap kendaraan sebelum dikirim." actions={<Link className={`${styles.linkButton} ${styles.linkOutline}`} href="/peminjam/pengembalian"><ArrowLeft size={16} /> Kembali</Link>} /><Panel title="Ringkasan peminjaman"><DetailGrid><DetailItem label="Keperluan" wide>{request.purpose}</DetailItem><DetailItem label="Periode">{formatDate(request.borrowDate)} - {formatDate(request.plannedReturnDate)}</DetailItem><DetailItem label="Lokasi">{request.activityLocation}</DetailItem><DetailItem label="Kendaraan" wide><div className={styles.itemRows}>{request.items.map((entry) => <div className={styles.itemRow} key={entry.id}><strong>{entry.item.name}</strong><Badge tone="info">{entry.quantity} {entry.item.unit}</Badge></div>)}</div></DetailItem></DetailGrid></Panel><ReturnForm requestId={request.id} number={request.registrationNumber} itemCount={request.items.length} /></div>;
}
