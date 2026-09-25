"use client";

import { FormEvent, useState } from "react";
import { Button, Panel } from "@/components";
import s from "./admin.module.css";

export function SettingsForm({ initial }: { initial: { standardDurationDays: number; minimumLeadDays: number; returnReminder: boolean; overdueEscalation: boolean } }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ standardDurationDays: Number(form.get("standardDurationDays")), minimumLeadDays: Number(form.get("minimumLeadDays")), returnReminder: form.get("returnReminder") === "on", overdueEscalation: form.get("overdueEscalation") === "on" }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Pengaturan belum dapat disimpan.");
      setMessage("Pengaturan operasional berhasil disimpan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pengaturan belum dapat disimpan."); }
    finally { setBusy(false); }
  }
  return <form className={s.stack} onSubmit={submit} aria-busy={busy}>{message && <p className={s.note} role="status">{message}</p>}{error && <p className={s.error} role="alert">{error}</p>}<div className={s.grid2}><Panel title="Aturan peminjaman" description="Parameter operasional untuk pengajuan kendaraan."><div className={s.settingRow}><label htmlFor="standardDurationDays"><strong>Batas durasi standar</strong><p>Maksimum hari kalender untuk peminjaman biasa.</p></label><input id="standardDurationDays" name="standardDurationDays" className="input" style={{ width: 90 }} type="number" min="1" max="90" defaultValue={initial.standardDurationDays} required /></div><div className={s.settingRow}><label htmlFor="minimumLeadDays"><strong>Jeda minimum pengajuan</strong><p>Hari sebelum tanggal penggunaan.</p></label><input id="minimumLeadDays" name="minimumLeadDays" className="input" style={{ width: 90 }} type="number" min="0" max="30" defaultValue={initial.minimumLeadDays} required /></div></Panel><Panel title="Notifikasi" description="Pengingat proses peminjaman dan pengembalian."><label className={s.settingRow}><span><strong>Pengingat pengembalian</strong><p>Kirim pemberitahuan sebelum batas pengembalian.</p></span><input className={s.switch} name="returnReminder" type="checkbox" defaultChecked={initial.returnReminder} /></label><label className={s.settingRow}><span><strong>Eskalasi keterlambatan</strong><p>Tandai dan beritahu administrator saat melewati batas.</p></span><input className={s.switch} name="overdueEscalation" type="checkbox" defaultChecked={initial.overdueEscalation} /></label></Panel></div><div className={s.stickyActions}><Button type="submit" loading={busy}>{busy ? "Menyimpan..." : "Simpan pengaturan"}</Button></div></form>;
}
