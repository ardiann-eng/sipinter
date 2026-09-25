"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components";
import s from "./admin.module.css";

export function UserAccessForm({ id, name, role, status }: { id: string; name: string; role: "BORROWER" | "APPROVER"; status: "ACTIVE" | "INACTIVE" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ role: form.get("role"), status: form.get("status") }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Akses pengguna belum dapat diperbarui.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Akses pengguna belum dapat diperbarui.");
    } finally { setBusy(false); }
  }
  return <form className={s.accessForm} onSubmit={submit} aria-busy={busy}>
    <select className="select" name="role" defaultValue={role} aria-label={`Peran ${name}`}><option value="BORROWER">Peminjam</option><option value="APPROVER">Sekda</option></select>
    <select className="select" name="status" defaultValue={status} aria-label={`Status akun ${name}`}><option value="ACTIVE">Aktif</option><option value="INACTIVE">Nonaktif</option></select>
    <Button type="submit" size="sm" loading={busy}>Simpan</Button>
    {error && <small className={s.error} role="alert">{error}</small>}
  </form>;
}
