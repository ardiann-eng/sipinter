import { PageHeader } from "@/components";
import { LoanForm } from "@/components/borrower/loan-form";
import styles from "@/components/borrower/borrower.module.css";

export default function ApplyPage() {
  return <div className={styles.page}><PageHeader eyebrow="Pengajuan baru" title="Ajukan Peminjaman" description="Lengkapi lima langkah berikut. Pengajuan diperiksa administrator sebelum diteruskan untuk persetujuan." /><LoanForm /></div>;
}
