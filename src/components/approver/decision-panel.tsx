"use client";

import { useId, useState } from "react";
import { AlertTriangle, CheckCircle2, Gavel, ShieldAlert, XCircle } from "lucide-react";
import { Badge, Button, Modal } from "@/components";

type Decision = "approve" | "reject" | null;

export function DecisionPanel({ disabled = false }: { disabled?: boolean }) {
  const reasonHelpId = useId();
  const reasonErrorId = useId();
  const [decision, setDecision] = useState<Decision>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<Decision>(null);

  function submit() {
    if (decision === "reject" && reason.trim().length < 20) {
      setError("Alasan penolakan wajib diisi minimal 20 karakter.");
      return;
    }
    setCompleted(decision);
    setDecision(null);
  }

  if (disabled) return <aside className="decision-panel decision-panel--closed"><Badge tone="neutral">Permohonan telah diputuskan</Badge><h2>Keputusan bersifat final</h2><p>Catatan keputusan tersedia pada riwayat persetujuan dan audit sistem.</p></aside>;
  if (completed) return <aside className="decision-panel decision-panel--complete" role="status" aria-live="polite"><CheckCircle2 size={30} /><h2>Keputusan tercatat</h2><p>Permohonan telah {completed === "approve" ? "disetujui" : "ditolak"}. Administrator dan pemohon akan menerima notifikasi.</p></aside>;

  return <>
    <aside className="decision-panel">
      <div className="decision-panel__icon"><Gavel size={22} /></div><span className="decision-panel__eyebrow">Keputusan Sekretaris Daerah</span><h2>Persetujuan formal</h2>
      <p>Pastikan identitas, tujuan kedinasan, periode, barang, dan catatan verifikasi telah ditelaah.</p>
      <div className="audit-notice"><ShieldAlert size={18} /><span>Setiap keputusan direkam permanen dalam audit log beserta waktu, akun, dan alamat akses.</span></div>
      <Button variant="secondary" size="lg" onClick={() => setDecision("approve")}><CheckCircle2 size={18} />Setujui permohonan</Button>
      <Button variant="outline" size="lg" onClick={() => setDecision("reject")}><XCircle size={18} />Tolak permohonan</Button>
    </aside>
    <Modal open={decision !== null} onClose={() => { setDecision(null); setError(""); }} title={decision === "approve" ? "Konfirmasi persetujuan" : "Tolak permohonan"} description={decision === "approve" ? "Keputusan akan meneruskan permohonan ke proses penyiapan dan penyerahan barang." : "Penolakan menghentikan proses permohonan ini."} footer={<><Button variant="ghost" onClick={() => setDecision(null)}>Batal</Button><Button variant={decision === "approve" ? "secondary" : "danger"} onClick={submit}>{decision === "approve" ? "Ya, setujui" : "Catat penolakan"}</Button></>}>
      {decision === "reject" && <label className="decision-field"><span>Alasan penolakan <b aria-hidden="true">*</b></span><textarea value={reason} onChange={(event) => { setReason(event.target.value); setError(""); }} rows={5} placeholder="Tuliskan alasan yang jelas dan dapat ditindaklanjuti pemohon..." required aria-invalid={Boolean(error)} aria-describedby={`${reasonHelpId}${error ? ` ${reasonErrorId}` : ""}`} />{error && <small id={reasonErrorId} role="alert">{error}</small>}<em id={reasonHelpId}>{reason.trim().length}/20 karakter minimum</em></label>}
      <div className="modal-audit-warning"><AlertTriangle size={20} /><p><strong>Peringatan audit</strong>Keputusan tidak dapat diubah setelah dikonfirmasi. Identitas pemberi keputusan dan catatan akan tersimpan dalam audit log SIPINTER.</p></div>
    </Modal>
  </>;
}
