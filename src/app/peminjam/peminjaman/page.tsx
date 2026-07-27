import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, Select } from "@/components";
import { borrowerRequests } from "@/components/borrower/borrower-data";
import { RequestList } from "@/components/borrower/borrower-ui";
import styles from "@/components/borrower/borrower.module.css";

export default function BorrowingsPage() {
  const active = borrowerRequests.filter((request) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(request.status));
  return <div className={styles.page}><PageHeader eyebrow="Layanan peminjam" title="Peminjaman Saya" description="Pantau status, jadwal, dan rincian seluruh pengajuan yang masih berjalan." actions={<Link className={`${styles.linkButton} ${styles.linkPrimary}`} href="/peminjam/ajukan"><Plus size={16} /> Ajukan peminjaman</Link>} /><div className={styles.filters}><Select aria-label="Filter status" defaultValue="all"><option value="all">Semua status aktif</option><option value="verification">Verifikasi admin</option><option value="revision">Perlu revisi</option><option value="borrowed">Sedang dipinjam</option></Select><Select aria-label="Urutkan" defaultValue="new"><option value="new">Terbaru</option><option value="old">Terlama</option></Select></div><RequestList requests={active} emptyAction={<Link className={`${styles.linkButton} ${styles.linkPrimary}`} href="/peminjam/ajukan"><Plus size={16} /> Ajukan peminjaman</Link>} /></div>;
}
