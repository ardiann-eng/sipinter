import Link from "next/link";
import { PageHeader } from "@/components";
import { borrowerRequests } from "@/components/borrower/borrower-data";
import { RequestList } from "@/components/borrower/borrower-ui";
import styles from "@/components/borrower/borrower.module.css";

export default function ReturnsPage() {
  const returns = borrowerRequests.filter((request) => ["BORROWED", "WAITING_RETURN", "OVERDUE", "WAITING_RETURN_VERIFICATION", "RETURN_PROBLEM"].includes(request.status));
  return <div className={styles.page}><PageHeader title="Pengembalian" description="Kirim bukti kondisi barang paling lambat pada tanggal akhir peminjaman." /><RequestList requests={returns} detailBase="/peminjam/pengembalian" emptyTitle="Tidak ada pengembalian" empty="Tidak ada barang yang perlu dikembalikan saat ini." emptyAction={<Link className={`${styles.linkButton} ${styles.linkOutline}`} href="/peminjam/riwayat">Lihat riwayat peminjaman</Link>} /></div>;
}
