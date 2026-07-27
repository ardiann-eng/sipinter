import Link from "next/link";
import { ShieldX } from "lucide-react";
import styles from "../notifikasi/shared.module.css";

export default function AccessDeniedPage() {
  return <main className={styles.state}><section className={styles.stateCard}><span className={styles.stateIcon}><ShieldX size={31} /></span><h1>Akses ditolak</h1><p>Akun Anda tidak memiliki peran yang dibutuhkan untuk membuka halaman ini. Kembali ke halaman utama sesuai kewenangan.</p><Link className={styles.primary} href="/">Kembali ke beranda</Link></section></main>;
}
