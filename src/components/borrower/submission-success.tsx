"use client";

import { useEffect } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import styles from "./borrower.module.css";

export function SubmissionSuccess({ mode, registrationNumber }: { mode: "new" | "revision"; registrationNumber: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("sent");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return (
    <section className={styles.submissionSuccess} role="status" aria-live="polite" aria-labelledby="submission-success-title">
      <span className={styles.submissionSuccessIcon}><CheckCircle2 size={25} strokeWidth={2} aria-hidden="true" /></span>
      <div className={styles.submissionSuccessBody}>
        <p className={styles.submissionSuccessEyebrow}>{mode === "revision" ? "REVISI TERKIRIM" : "PENGAJUAN TERKIRIM"}</p>
        <h2 id="submission-success-title">{mode === "revision" ? "Perbaikan pengajuan berhasil dikirim" : "Pengajuan peminjaman berhasil dikirim"}</h2>
        <p>Nomor <strong>{registrationNumber}</strong> sudah tercatat. Administrator akan memeriksa pengajuan Anda sebelum diteruskan ke Sekda. Perubahan status akan tampil di halaman ini dan notifikasi.</p>
        <a href="#alur-peminjaman" className={styles.submissionSuccessLink}>Lihat alur peminjaman <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
