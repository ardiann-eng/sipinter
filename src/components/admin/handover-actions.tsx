"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, PackageCheck } from "lucide-react";
import { Button } from "@/components";
import s from "./admin.module.css";

export function HandoverActions({ requestId, status, borrowerName, borrowerNip }: {
  requestId: string;
  status: "APPROVED" | "READY_FOR_HANDOVER";
  borrowerName: string;
  borrowerNip: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send(data: FormData) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/borrowing-requests/${requestId}/handover`, { method: "POST", body: data });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Penyerahan belum dapat diproses.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Penyerahan belum dapat diproses.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "APPROVED") {
    return <div className={s.stack}>
      <p className={s.note}>Pastikan kendaraan, pengemudi, dan jadwal pengambilan telah dikonfirmasi sebelum menyiapkan serah terima.</p>
      {error && <p className={s.error} role="alert">{error}</p>}
      <Button type="button" loading={loading} onClick={() => {
        const data = new FormData();
        data.set("stage", "PREPARE");
        void send(data);
      }}><PackageCheck size={16} aria-hidden="true" />{loading ? "Menyiapkan..." : "Siapkan penyerahan"}</Button>
    </div>;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("stage", "HANDOVER");
    await send(data);
  }

  return <form className={s.stack} onSubmit={submit} aria-busy={loading}>
    <div className={s.formGrid}>
      <label className="field"><span className="field__label">Penerima kendaraan</span><input className="input" value={borrowerName} disabled /></label>
      <label className="field"><span className="field__label">NIP penerima</span><input className="input" value={borrowerNip} disabled /></label>
      <label className={`field ${s.full}`}><span className="field__label">Catatan kondisi awal</span><textarea className={s.textarea} name="note" maxLength={2000} placeholder="Catat odometer, bahan bakar, kelengkapan, atau informasi serah terima lainnya." /></label>
      <label className={`field ${s.full}`}><span className="field__label"><Camera size={16} aria-hidden="true" /> Bukti serah terima *</span><input className="input" name="proof" type="file" accept="image/jpeg,image/png,application/pdf" required /><small>Foto atau PDF, maksimal 5 MB.</small></label>
    </div>
    <label className={s.check}><input name="confirmed" type="checkbox" required /><span>Kondisi kendaraan, kunci, dan dokumen telah diperiksa bersama penerima.</span></label>
    {error && <p className={s.error} role="alert">{error}</p>}
    <Button type="submit" loading={loading}><CheckCircle2 size={16} aria-hidden="true" />{loading ? "Menyimpan..." : "Catat kendaraan telah diserahkan"}</Button>
  </form>;
}
