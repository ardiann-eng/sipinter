"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Panel } from "@/components";
import type { InventoryItem } from "@/lib/mock-data";
import s from "./admin.module.css";

export function InventoryForm({ item }: { item?: InventoryItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      itemCode: form.get("itemCode"),
      registrationNumber: form.get("registrationNumber"),
      totalQuantity: form.get("totalQuantity"),
      unit: form.get("unit"),
      condition: form.get("condition"),
      status: form.get("status") ?? "AVAILABLE",
      location: form.get("location"),
      procurementYear: form.get("procurementYear"),
      description: form.get("description") || undefined,
      mainPhoto: form.get("mainPhoto") || undefined,
    };
    try {
      const response = await fetch(item ? `/api/items/${item.id}` : "/api/items", {
        method: item ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error ?? "Data kendaraan belum dapat disimpan.");
      router.push(`/admin/barang/${result.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data kendaraan belum dapat disimpan.");
    } finally {
      setBusy(false);
    }
  }

  return <form className={s.stack} onSubmit={submit} aria-busy={busy}>
    {error && <p className={s.error} id="inventory-form-error" role="alert">{error}</p>}
    <Panel title="Identitas kendaraan" description="Kolom bertanda bintang wajib diisi.">
      <div className={s.formGrid}>
        <label className="field"><span className="field__label">Nama kendaraan *</span><input className="input" name="name" defaultValue={item?.name} maxLength={255} required /></label>
        <label className="field"><span className="field__label">Kode kendaraan *</span><input className="input" name="itemCode" defaultValue={item?.code} placeholder="KDR-HAC-00001" maxLength={64} required /></label>
        <label className="field"><span className="field__label">Nomor polisi *</span><input className="input" name="registrationNumber" defaultValue={item?.registrationNumber} placeholder="DD 7001 TF" maxLength={32} required /></label>
        <label className="field"><span className="field__label">Tahun pengadaan *</span><input className="input" name="procurementYear" type="number" min="1900" max={new Date().getFullYear()} defaultValue={item?.acquisitionDate?.slice(0, 4) ?? new Date().getFullYear()} required /></label>
        <label className={`field ${s.full}`}><span className="field__label">Foto utama</span><input className="input" name="mainPhoto" defaultValue={item?.imageUrl} placeholder="/kendaraan/nama-file.jpg" /><small>Gunakan path aset publik yang tersedia.</small></label>
      </div>
    </Panel>
    <Panel title="Ketersediaan dan penempatan">
      <div className={s.formGrid}>
        <label className="field"><span className="field__label">Jumlah kendaraan *</span><input className="input" name="totalQuantity" type="number" min="1" defaultValue={item?.totalStock ?? 1} required /></label>
        <label className="field"><span className="field__label">Satuan *</span><input className="input" name="unit" defaultValue={item?.unit ?? "kendaraan"} maxLength={50} required /></label>
        <label className="field"><span className="field__label">Kondisi *</span><select className="select" name="condition" defaultValue={item?.condition ?? "GOOD"}><option value="GOOD">Baik</option><option value="LIGHTLY_DAMAGED">Rusak ringan</option><option value="HEAVILY_DAMAGED">Rusak berat</option><option value="LOST">Hilang</option></select></label>
        {item && <label className="field"><span className="field__label">Status operasional *</span><select className="select" name="status" defaultValue={item.status === "INACTIVE" ? "INACTIVE" : "AVAILABLE"}><option value="AVAILABLE">Aktif</option><option value="INACTIVE">Nonaktif</option></select></label>}
        <label className="field"><span className="field__label">Lokasi penyimpanan *</span><input className="input" name="location" defaultValue={item?.location ?? "Pool Kendaraan Balaikota"} maxLength={255} required /></label>
        <label className={`field ${s.full}`}><span className="field__label">Deskripsi</span><textarea className={s.textarea} name="description" defaultValue={item?.description} maxLength={2000} /></label>
      </div>
    </Panel>
    <div className={s.stickyActions}><Link className={s.linkButton} href="/admin/barang">Batal</Link><Button type="submit" loading={busy} aria-describedby={error ? "inventory-form-error" : undefined}>{busy ? "Menyimpan..." : "Simpan data kendaraan"}</Button></div>
  </form>;
}

export function InventoryExportButton({ items }: { items: InventoryItem[] }) {
  function download() {
    const rows = [["Kode", "Nomor Polisi", "Nama", "Tersedia", "Total", "Kondisi", "Status", "Lokasi"], ...items.map((item) => [item.code, item.registrationNumber, item.name, item.availableStock, item.totalStock, item.condition, item.status, item.location])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `kendaraan-sipinter-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return <Button type="button" variant="outline" onClick={download}>Ekspor CSV</Button>;
}
