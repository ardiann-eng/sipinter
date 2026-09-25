import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowRight, Box, CalendarClock, ClipboardPlus, History, RotateCcw } from "lucide-react";
import { BorrowingStatus, ItemStatus, Role } from "@prisma/client";
import welcomeBackground from "../../../../bg.png";
import { Badge, EmptyState, Panel, Timeline } from "@/components";
import { StatusBadge } from "@/components/borrower/borrower-ui";
import styles from "@/components/borrower/borrower.module.css";
import { requireRole } from "@/lib/auth";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { toInventoryItem } from "@/lib/inventory-view";

const terminal: BorrowingStatus[] = [BorrowingStatus.COMPLETED, BorrowingStatus.CANCELLED, BorrowingStatus.REJECTED];
const inUse: BorrowingStatus[] = [BorrowingStatus.BORROWED, BorrowingStatus.OVERDUE];

export default async function BorrowerHomePage() {
  const user = await requireRole([Role.BORROWER]);
  const [records, itemRecords] = await Promise.all([
    db.borrowingRequest.findMany({ where: { borrowerId: user.id }, include: { borrower: { include: { skpd: true } }, items: { include: { item: true } } }, orderBy: { updatedAt: "desc" } }),
    db.item.findMany({ where: { status: ItemStatus.AVAILABLE, availableQuantity: { gt: 0 } }, include: { category: true }, orderBy: [{ name: "asc" }, { itemCode: "asc" }] }),
  ]);
  const requests = records.map(toBorrowerRequest);
  const revision = requests.find((request) => request.status === BorrowingStatus.REVISION_REQUIRED);
  const active = requests.find((request) => !terminal.includes(request.status as BorrowingStatus));
  const borrowed = requests.find((request) => inUse.includes(request.status as BorrowingStatus));
  const completed = requests.filter((request) => request.status === BorrowingStatus.COMPLETED).slice(0, 3);
  const availableItems = itemRecords.map(toInventoryItem);
  const activeCount = requests.filter((request) => !terminal.includes(request.status as BorrowingStatus)).length;

  return <div className={styles.page}>
    {revision && <div className={styles.notice} role="alert"><AlertTriangle size={20} aria-hidden="true" /><div><strong>Pengajuan memerlukan revisi</strong><p>{revision.adminNote}</p><Link className={`${styles.linkButton} ${styles.linkButtonSmall} ${styles.linkGhost}`} href={`/peminjam/peminjaman/${revision.id}`}>Tinjau pengajuan <ArrowRight size={15} aria-hidden="true" /></Link></div></div>}
    <section className={styles.welcome}>
      <Image className={styles.welcomeBackground} src={welcomeBackground} alt="" fill priority sizes="(max-width: 900px) 100vw, 78vw" />
      <div className={styles.welcomeOverlay} aria-hidden="true" />
      <div className={styles.welcomeContent}><p className={styles.welcomeEyebrow}>RUANG KERJA PEMINJAM</p><h1>Selamat datang, <strong>{user.name}.</strong></h1><p className={styles.welcomeLead}>Kelola peminjaman barang dan fasilitas dinas dalam satu tempat.</p><div className={styles.actions}><Link className={`${styles.action} ${styles.actionPrimary}`} href="/peminjam/ajukan"><ClipboardPlus size={18} aria-hidden="true" /> Ajukan peminjaman</Link><Link className={styles.action} href="/peminjam/peminjaman"><Box size={18} aria-hidden="true" /> Peminjaman saya</Link><Link className={styles.action} href="/peminjam/pengembalian"><RotateCcw size={18} aria-hidden="true" /> Pengembalian</Link></div></div>
      <p className={styles.welcomeStatus}><span />{activeCount} proses peminjaman aktif</p>
    </section>
    <div className={styles.grid}>
      <Panel className={`${styles.span7} ${styles.activeCard}`} title="Pengajuan aktif" description={active?.number ?? "Belum ada proses berjalan"} action={active ? <StatusBadge status={active.status} /> : undefined}>
        {active ? <><div className={styles.activeTop}><div><h3>{active.purpose}</h3><span className={styles.muted}>{active.location}</span></div></div><div className={styles.facts}><div><span>Periode</span><strong>{formatDate(active.startDate, "dd MMM yyyy")}</strong></div><div><span>Kendaraan</span><strong>{active.items.reduce((sum, item) => sum + item.quantity, 0)} unit</strong></div><div><span>Diajukan</span><strong>{formatDate(active.submittedAt, "dd MMM")}</strong></div></div><Link className={`${styles.linkButton} ${styles.linkButtonSmall} ${styles.linkOutline}`} href={`/peminjam/peminjaman/${active.id}`}>Buka detail</Link></> : <EmptyState title="Belum ada pengajuan aktif" description="Ajukan kendaraan ketika ada kegiatan kedinasan yang perlu difasilitasi." action={<Link className={`${styles.linkButton} ${styles.linkPrimary}`} href="/peminjam/ajukan">Ajukan peminjaman</Link>} />}
      </Panel>
      <Panel className={styles.span5} title="Perkembangan terbaru"><Timeline items={active ? [{ id: "submitted", title: "Pengajuan diterima sistem", timestamp: formatDateTime(active.submittedAt), state: "complete" }, { id: "current", title: active.status === BorrowingStatus.READY_FOR_HANDOVER ? "Menunggu penyerahan" : active.status === BorrowingStatus.BORROWED ? "Kendaraan sedang digunakan" : active.status === BorrowingStatus.WAITING_RETURN_VERIFICATION ? "Pengembalian sedang diperiksa" : "Proses sedang berjalan", timestamp: "Status saat ini", state: "current" }] : [{ id: "empty", title: "Belum ada aktivitas", timestamp: "-", state: "upcoming" }]} /></Panel>
      {borrowed && <section className={`${styles.returnCallout} ${styles.span5}`}><div className={styles.returnCalloutTop}><span className={styles.returnIcon}><CalendarClock size={20} aria-hidden="true" /></span><Badge tone={borrowed.status === BorrowingStatus.OVERDUE ? "danger" : "warning"}>{borrowed.status === BorrowingStatus.OVERDUE ? "Terlambat" : formatDate(borrowed.endDate)}</Badge></div><p className={styles.sectionEyebrow}>PENGEMBALIAN TERDEKAT</p><h2>{borrowed.items[0]?.itemName}</h2><p>{borrowed.number}</p><span>Siapkan kendaraan dan foto kondisi akhir sebelum batas waktu.</span><Link className={`${styles.linkButton} ${styles.linkSecondary}`} href={`/peminjam/pengembalian/${borrowed.id}`}>Ajukan pengembalian <ArrowRight size={16} aria-hidden="true" /></Link></section>}
      <section className={`${styles.historyStrip} ${borrowed ? styles.span7 : styles.span12}`}><header><div><p className={styles.sectionEyebrow}>AKTIVITAS TERAKHIR</p><h2>Riwayat terbaru</h2></div><Link className={styles.historyLink} href="/peminjam/riwayat">Semua riwayat <ArrowRight size={15} aria-hidden="true" /></Link></header><div className={styles.available}>{completed.length ? completed.map((request) => <div className={styles.historyItem} key={request.id}><span className={styles.itemIcon}><History size={18} aria-hidden="true" /></span><div><strong>{request.purpose}</strong><small>{request.number} · {formatDate(request.endDate)}</small></div><StatusBadge status={request.status} /></div>) : <p className={styles.muted}>Belum ada peminjaman yang selesai.</p>}</div></section>
      <section className={`${styles.facilityList} ${styles.span12}`}><header><div><p className={styles.sectionEyebrow}>KATALOG INVENTARIS</p><h2>Barang & fasilitas tersedia</h2><span>Pilih ruangan, kendaraan, atau perlengkapan sesuai kebutuhan kegiatan.</span></div><Link className={`${styles.linkButton} ${styles.linkOutline}`} href="/peminjam/ajukan">Pilih barang <ArrowRight size={16} aria-hidden="true" /></Link></header><div className={styles.available}>{availableItems.map((item) => <div className={styles.facilityItem} key={item.id}>{item.imageUrl ? <span className={styles.facilityImage}><Image src={item.imageUrl} alt="" fill sizes="64px" /></span> : <span className={styles.itemIcon}><Box size={18} aria-hidden="true" /></span>}<div><strong>{item.name}</strong><small>{item.category} · {item.code}</small></div><Badge tone="success">{item.availableStock} {item.unit}</Badge></div>)}</div></section>
    </div>
  </div>;
}
