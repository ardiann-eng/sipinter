"use client";

import { useState } from "react";
import { Button, Input } from "@/components";
import styles from "./borrower.module.css";

export function ProfileContactForm({ email, phone }: { email: string; phone: string | null }) {
  const [value, setValue] = useState(phone ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setSaved("");
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone: value }) });
      const result = await response.json() as { error?: string; phone?: string | null };
      if (!response.ok) throw new Error(result.error ?? "Profil belum dapat disimpan.");
      setValue(result.phone ?? "");
      setSaved("Nomor telepon berhasil disimpan.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Profil belum dapat disimpan."); }
    finally { setBusy(false); }
  }

  return <form className={styles.formGrid} onSubmit={submit} aria-busy={busy}>
    <Input label="Email kedinasan" value={email} disabled />
    <Input label="Nomor telepon" name="phone" value={value} onChange={(event) => setValue(event.target.value)} error={error} hint="Contoh: 081234567890" inputMode="tel" autoComplete="tel" />
    <div className={styles.wide}><Button type="submit" loading={busy}>Simpan nomor telepon</Button>{saved && <p role="status">{saved}</p>}</div>
  </form>;
}
