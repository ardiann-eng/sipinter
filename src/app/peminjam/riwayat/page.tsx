import { PageHeader, Select } from "@/components";
import { borrowerRequests } from "@/components/borrower/borrower-data";
import { RequestList } from "@/components/borrower/borrower-ui";
import styles from "@/components/borrower/borrower.module.css";

export default function HistoryPage() {
  const history = borrowerRequests.filter((request) => ["COMPLETED", "CANCELLED", "REJECTED"].includes(request.status));
  return <div className={styles.page}><PageHeader eyebrow="Arsip pribadi" title="Riwayat Peminjaman" description="Rekam pengajuan yang telah selesai, ditolak, atau dibatalkan." /><div className={styles.filters}><Select aria-label="Tahun" defaultValue="2026"><option>2026</option><option>2025</option></Select><Select aria-label="Status" defaultValue="all"><option value="all">Semua hasil</option><option value="COMPLETED">Selesai</option><option value="REJECTED">Ditolak</option></Select></div><RequestList requests={history} /></div>;
}
