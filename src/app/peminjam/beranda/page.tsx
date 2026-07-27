import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CalendarClock,
  ClipboardPlus,
  History,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import welcomeBackground from "../../../../bg.png";
import { Badge, Panel, Timeline } from "@/components";
import { formatDate } from "@/lib/format";
import {
  availableItems,
  borrowerRequests,
} from "@/components/borrower/borrower-data";
import { StatusBadge } from "@/components/borrower/borrower-ui";
import styles from "@/components/borrower/borrower.module.css";

export default function BorrowerHomePage() {
  const active = borrowerRequests.find(
    (request) => request.status === "WAITING_ADMIN_VERIFICATION",
  )!;
  const revision = borrowerRequests.find(
    (request) => request.status === "REVISION_REQUIRED",
  )!;
  const borrowed = borrowerRequests.find(
    (request) => request.status === "BORROWED",
  )!;
  const completed = borrowerRequests.filter(
    (request) => request.status === "COMPLETED",
  );
  return (
    <div className={styles.page}>
      <div className={styles.notice} role="alert">
        <AlertTriangle size={20} />
        <div>
          <strong>Pengajuan memerlukan revisi</strong>
          <p>{revision.adminNote}</p>
          <Link
            className={`${styles.linkButton} ${styles.linkButtonSmall} ${styles.linkGhost}`}
            href={`/peminjam/peminjaman/${revision.id}`}
          >
            Tinjau pengajuan <ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <section className={styles.welcome}>
        <Image
          className={styles.welcomeBackground}
          src={welcomeBackground}
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 100vw, 78vw"
        />
        <div className={styles.welcomeOverlay} aria-hidden="true" />
        <div className={styles.welcomeContent}>
          <p className={styles.welcomeEyebrow}>RUANG KERJA PEMINJAM</p>
          <h1>
            Selamat datang, <strong>Ahmad.</strong>
          </h1>
          <p className={styles.welcomeLead}>
            Kelola peminjaman fasilitas kedinasan dalam satu tempat.
          </p>
          <div className={styles.actions}>
            <Link
              className={`${styles.action} ${styles.actionPrimary}`}
              href="/peminjam/ajukan"
            >
              <ClipboardPlus size={18} /> Ajukan peminjaman
            </Link>
            <Link className={styles.action} href="/peminjam/peminjaman">
              <Box size={18} /> Peminjaman saya
            </Link>
            <Link className={styles.action} href="/peminjam/pengembalian">
              <RotateCcw size={18} /> Pengembalian
            </Link>
          </div>
        </div>
        <p className={styles.welcomeStatus}>
          <span />1 pengajuan sedang diperiksa
        </p>
      </section>
      <div className={styles.grid}>
        <Panel
          className={`${styles.span7} ${styles.activeCard}`}
          title="Pengajuan aktif"
          description={active.number}
          action={<StatusBadge status={active.status} />}
        >
          <div className={styles.activeTop}>
            <div>
              <h3>{active.purpose}</h3>
              <span className={styles.muted}>{active.location}</span>
            </div>
          </div>
          <div className={styles.facts}>
            <div>
              <span>Periode</span>
              <strong>{formatDate(active.startDate, "dd MMM yyyy")}</strong>
            </div>
            <div>
              <span>Barang</span>
              <strong>{active.items.length} jenis</strong>
            </div>
            <div>
              <span>Diajukan</span>
              <strong>{formatDate(active.submittedAt, "dd MMM")}</strong>
            </div>
          </div>
          <Link
            className={`${styles.linkButton} ${styles.linkButtonSmall} ${styles.linkOutline}`}
            href={`/peminjam/peminjaman/${active.id}`}
          >
            Buka detail
          </Link>
        </Panel>
        <Panel className={styles.span5} title="Perkembangan pengajuan">
          <Timeline
            items={[
              {
                id: "1",
                title: "Pengajuan dikirim",
                timestamp: "17 Jul, 09.12",
                state: "complete",
              },
              {
                id: "2",
                title: "Verifikasi administrasi",
                description: "Dokumen sedang diperiksa petugas.",
                timestamp: "Berjalan",
                state: "current",
              },
              {
                id: "3",
                title: "Persetujuan Sekda",
                timestamp: "Berikutnya",
                state: "upcoming",
              },
            ]}
          />
        </Panel>
        <section className={`${styles.returnCallout} ${styles.span5}`}>
          <div className={styles.returnCalloutTop}>
            <span className={styles.returnIcon}>
              <CalendarClock size={20} />
            </span>
            <Badge tone="warning">Besok, 19 Juli</Badge>
          </div>
          <p className={styles.sectionEyebrow}>PENGEMBALIAN TERDEKAT</p>
          <h2>{borrowed.items[0].itemName}</h2>
          <p>{borrowed.number}</p>
          <span>
            Siapkan barang lengkap dan foto kondisi akhir sebelum batas waktu.
          </span>
          <Link
            className={`${styles.linkButton} ${styles.linkSecondary}`}
            href={`/peminjam/pengembalian/${borrowed.id}`}
          >
            Ajukan pengembalian <ArrowRight size={16} />
          </Link>
        </section>
        <section className={`${styles.historyStrip} ${styles.span7}`}>
          <header>
            <div>
              <p className={styles.sectionEyebrow}>AKTIVITAS TERAKHIR</p>
              <h2>Riwayat terbaru</h2>
            </div>
            <Link className={styles.historyLink} href="/peminjam/riwayat">
              Semua riwayat <ArrowRight size={15} />
            </Link>
          </header>
          <div className={styles.available}>
            {completed.map((request) => (
              <div className={styles.historyItem} key={request.id}>
                <span className={styles.itemIcon}>
                  <History size={18} />
                </span>
                <div>
                  <strong>{request.purpose}</strong>
                  <small>
                    {request.number} · {formatDate(request.endDate)}
                  </small>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
          </div>
        </section>
        <section className={`${styles.facilityList} ${styles.span12}`}>
          <header>
            <div>
              <p className={styles.sectionEyebrow}>KATALOG FASILITAS</p>
              <h2>Fasilitas tersedia</h2>
              <span>Stok dapat berubah setelah verifikasi pengajuan.</span>
            </div>
            <Link
              className={`${styles.linkButton} ${styles.linkOutline}`}
              href="/peminjam/ajukan"
            >
              Pilih barang <ArrowRight size={16} />
            </Link>
          </header>
          <div className={styles.available}>
            {availableItems.map((item) => (
              <div className={styles.facilityItem} key={item.id}>
                <span className={styles.itemIcon}>
                  <Box size={18} />
                </span>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.category} · {item.location}
                  </small>
                </div>
                <Badge tone="success">
                  {item.availableStock} {item.unit}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
