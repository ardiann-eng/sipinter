import Link from "next/link";
import { Clock3 } from "lucide-react";
import styles from "../notifikasi/shared.module.css";

export default function SessionExpiredPage() {
  return <main className={styles.state}><section className={styles.stateCard}><span className={styles.stateIcon}><Clock3 size={31} /></span><h1>Sesi berakhir</h1><p>Sesi Anda tidak valid atau telah melewati batas waktu delapan jam. Masuk kembali untuk melanjutkan pekerjaan secara aman.</p><Link className={styles.primary} href="/login">Masuk kembali</Link></section></main>;
}
