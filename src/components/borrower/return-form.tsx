"use client";

import { useState } from "react";
import { Camera, Send } from "lucide-react";
import { Button, Input, Panel, Select } from "@/components";
import type { InventoryRequest } from "@/lib/mock-data";
import styles from "./borrower.module.css";

const evidenceLabels = [
  "Foto tampak depan",
  "Foto tampak belakang",
  "Foto nomor inventaris",
  "Foto kelengkapan barang",
] as const;
const allowedPhotoTypes = ["image/jpeg", "image/png"];

export function ReturnForm({ request }: { request: InventoryRequest }) {
  const [photos, setPhotos] = useState<Array<File | null>>([
    null,
    null,
    null,
    null,
  ]);
  const [condition, setCondition] = useState("");
  const [returnedAt, setReturnedAt] = useState("2026-07-18");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit() {
    const next: Record<string, string> = {};
    const files = photos.filter((photo): photo is File => Boolean(photo));
    if (!condition) next.condition = "Kondisi akhir wajib dipilih.";
    if (!returnedAt) next.returnedAt = "Tanggal pengembalian wajib diisi.";
    if (files.length < 2 || files.length > 4)
      next.photos = "Unggah 2-4 foto bukti kondisi barang.";
    files.forEach((file) => {
      if (!allowedPhotoTypes.includes(file.type))
        next.photos = "Foto harus berformat JPG atau PNG.";
      if (file.size > 5 * 1024 * 1024)
        next.photos = "Ukuran setiap foto maksimal 5 MB.";
    });
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  return (
    <div className={styles.page}>
      {sent && (
        <div className={styles.success} role="status" aria-live="polite">
          Pengembalian berhasil diajukan. Simpan barang sampai petugas
          menyelesaikan verifikasi.
        </div>
      )}
      <Panel
        title="Kondisi pengembalian"
        description={`Bukti untuk ${request.items.length} jenis barang pada ${request.number}`}
      >
        <div className={styles.formGrid}>
          <Select
            label="Kondisi akhir barang"
            required
            value={condition}
            onChange={(event) => {
              setCondition(event.target.value);
              setErrors((current) => ({ ...current, condition: "" }));
            }}
            error={errors.condition}
          >
            <option value="">Pilih kondisi</option>
            <option value="GOOD">Baik dan lengkap</option>
            <option value="LIGHTLY_DAMAGED">Rusak ringan</option>
            <option value="HEAVILY_DAMAGED">Rusak berat</option>
            <option value="LOST">Hilang / tidak lengkap</option>
          </Select>
          <Input
            label="Tanggal pengembalian"
            type="date"
            required
            max="2026-07-19"
            value={returnedAt}
            onChange={(event) => setReturnedAt(event.target.value)}
            error={errors.returnedAt}
          />
          <div className={`${styles.field} ${styles.wide}`}>
            <label htmlFor="return-note">Catatan kondisi</label>
            <textarea
              id="return-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Jelaskan kerusakan, kekurangan, atau informasi lain bila ada"
            />
          </div>
        </div>
      </Panel>
      <Panel
        title="Bukti foto"
        description="Wajib 2-4 foto. Gunakan label bukti berikut agar verifikasi jelas."
      >
        <div className={styles.photoGrid}>
          {evidenceLabels.map((label, index) => (
            <label
              className={styles.photo}
              key={label}
              htmlFor={`photo-${index}`}
            >
              <Camera size={20} />
              <strong>{label}</strong>
              <span className={styles.muted}>
                {index < 2 ? "Wajib" : "Opsional"} · JPG/PNG · maksimal 5 MB
              </span>
              <input
                id={`photo-${index}`}
                type="file"
                accept="image/jpeg,image/png"
                aria-describedby={`photo-${index}-name`}
                onChange={(event) => {
                  const next = [...photos];
                  next[index] = event.target.files?.[0] ?? null;
                  setPhotos(next);
                  setErrors((current) => ({ ...current, photos: "" }));
                }}
              />
              <span
                id={`photo-${index}-name`}
                className={styles.fileName}
                aria-live="polite"
              >
                {photos[index]?.name}
              </span>
            </label>
          ))}
        </div>
        {errors.photos && (
          <span className={styles.error} role="alert">
            {errors.photos}
          </span>
        )}
        <div className={styles.formFooter}>
          <span className={styles.muted} aria-live="polite">
            {photos.filter(Boolean).length} dari maksimal 4 foto dipilih
          </span>
          <Button type="button" onClick={submit}>
            <Send size={16} /> Kirim pengembalian
          </Button>
        </div>
      </Panel>
    </div>
  );
}
