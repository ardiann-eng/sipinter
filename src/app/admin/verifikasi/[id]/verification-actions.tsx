"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components";
import styles from "./verification-actions.module.css";

export function VerificationActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"REQUEST_REVISION" | "REJECT" | "FORWARD_TO_APPROVER" | null>(null);

  async function transition(action: NonNullable<typeof busy>) {
    if ((action === "REQUEST_REVISION" || action === "REJECT") && note.trim().length < 10) {
      setError("Catatan minimal 10 karakter wajib diisi untuk revisi atau penolakan.");
      return;
    }
    setBusy(action);
    setError("");
    try {
      const response = await fetch(`/api/borrowing-requests/${requestId}/transition`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Aksi belum dapat diproses.");
      router.push("/admin/verifikasi");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Aksi belum dapat diproses.");
    } finally {
      setBusy(null);
    }
  }

  return <div className={styles.decisionForm}>
    <label className={`field ${styles.noteField}`}>
      <span className="field__label">Catatan untuk pemohon / Sekda</span>
      <textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tulis hasil pemeriksaan atau alasan keputusan..." aria-invalid={Boolean(error)} aria-describedby={error ? "verification-action-error" : "verification-action-hint"} />
      <span className="field__hint" id="verification-action-hint">Wajib untuk revisi atau penolakan. Opsional saat diteruskan.</span>
      {error && <span className="field__error" id="verification-action-error" role="alert">{error}</span>}
    </label>
    <div className={styles.decisionActions}>
      <Button loading={busy === "FORWARD_TO_APPROVER"} disabled={busy !== null} onClick={() => transition("FORWARD_TO_APPROVER")}>Teruskan ke Sekda</Button>
      <div className={styles.secondaryActions}>
        <Button variant="outline" loading={busy === "REQUEST_REVISION"} disabled={busy !== null} onClick={() => transition("REQUEST_REVISION")}>Minta revisi</Button>
        <Button variant="danger" loading={busy === "REJECT"} disabled={busy !== null} onClick={() => transition("REJECT")}>Tolak</Button>
      </div>
    </div>
  </div>;
}
