import Link from "next/link";
import { BorrowingStatus, ItemCondition, ItemStatus, Role } from "@prisma/client";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { AdminHeader, LinkButton, Panel, RequestTable, formatDateTime, s } from "@/components/admin/admin-ui";
import { requireRole } from "@/lib/auth";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { db } from "@/lib/db";
import { runBorrowingMaintenance } from "@/lib/borrowing-maintenance";

export const dynamic = "force-dynamic";

export default async function RingkasanPage() {
  const actor = await requireRole([Role.ADMIN]);
  await runBorrowingMaintenance(actor).catch((error) => {
    console.error("Borrowing maintenance failed while loading the admin dashboard", error);
  });
  const [requests, activeBorrowings, overdueReturns, items, recentAudits] = await Promise.all([
    db.borrowingRequest.findMany({ where: { status: BorrowingStatus.WAITING_ADMIN_VERIFICATION }, include: { borrower: { include: { skpd: true } }, items: { include: { item: true } } }, orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }], take: 5 }),
    db.borrowingRequest.count({ where: { status: BorrowingStatus.BORROWED } }),
    db.borrowingRequest.count({ where: { status: BorrowingStatus.OVERDUE } }),
    db.item.findMany({ select: { condition: true, status: true, totalQuantity: true, availableQuantity: true } }),
    db.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const ready = await db.borrowingRequest.count({ where: { status: { in: [BorrowingStatus.APPROVED, BorrowingStatus.READY_FOR_HANDOVER] } } });
  const totalUnits = items.reduce((sum, item) => sum + item.totalQuantity, 0);
  const availableUnits = items.reduce((sum, item) => sum + (item.status === ItemStatus.AVAILABLE ? item.availableQuantity : 0), 0);
  const conditionCounts = Object.values(ItemCondition).map((condition) => ({ condition, count: items.filter((item) => item.condition === condition).length }));
  return <>
    <AdminHeader title="Ringkasan operasional" description={`Kondisi layanan per ${formatDateTime(new Date())} WITA.`} actions={<LinkButton href="/admin/laporan" secondary>Lihat laporan</LinkButton>} />
    <section className={s.summaryStrip} aria-label="Ringkasan utama"><div className={s.summaryItem}><span>Perlu verifikasi</span><strong>{requests.length}</strong><small>Permohonan baru</small></div><div className={s.summaryItem}><span>Perlu diserahkan</span><strong>{ready}</strong><small>Disetujui atau siap</small></div><div className={s.summaryItem}><span>Peminjaman aktif</span><strong>{activeBorrowings}</strong><small>Kendaraan sedang digunakan</small></div><div className={s.summaryItem}><span>Pengembalian terlambat</span><strong>{overdueReturns}</strong><small>Perlu tindak lanjut</small></div><div className={s.summaryItem}><span>Ketersediaan kendaraan</span><strong>{availableUnits} / {totalUnits}</strong><small>Unit siap digunakan</small></div></section>
    <div className={s.grid7030}><Panel title="Prioritas verifikasi" description="Diurutkan menurut waktu pengajuan terlama." flush action={<Link className={s.link} href="/admin/verifikasi">Semua permohonan</Link>}>{requests.length ? <RequestTable requests={requests.map(toBorrowerRequest)} /> : <p className={s.empty}>Tidak ada permohonan baru yang perlu diverifikasi.</p>}</Panel><Panel title="Kondisi kendaraan" description={`${items.length} kendaraan tercatat`}><div className={s.condition}>{conditionCounts.map(({ condition, count }) => <div key={condition}><span>{condition === "GOOD" ? "Baik" : condition === "LIGHTLY_DAMAGED" ? "Rusak ringan" : condition === "HEAVILY_DAMAGED" ? "Rusak berat" : "Hilang"}</span><strong>{count}</strong><small>{items.length ? Math.round(count / items.length * 100) : 0}%</small></div>)}</div>{conditionCounts.some((entry) => entry.condition !== ItemCondition.GOOD && entry.count > 0) && <div className={`${s.note} ${s.dangerNote}`} style={{ marginTop: 16 }}><AlertTriangle size={16} aria-hidden="true" /> Ada kendaraan yang memerlukan tindak lanjut kondisi.</div>}</Panel></div>
    <Panel title="Aktivitas terkini" description="Jejak kegiatan penting dalam sistem."><ul className={s.activity}>{recentAudits.length ? recentAudits.map((entry) => <li key={entry.id}><p><strong>{entry.user?.name ?? "Sistem"}</strong> · {entry.action} {entry.module} {entry.objectId ? `(${entry.objectId})` : ""}</p><time>{formatDateTime(entry.createdAt)} WITA</time></li>) : <li><p>Belum ada aktivitas yang tercatat.</p></li>}</ul><Link className={s.link} href="/admin/audit">Buka audit lengkap <ArrowUpRight size={14} aria-hidden="true" /></Link></Panel>
  </>;
}
