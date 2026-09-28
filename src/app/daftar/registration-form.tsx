"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import anniversaryLogo from "../../../images.png";
import cityLogo from "../../../logo-makassarkota-239x300.png";
import styles from "./registration.module.css";
import { Select } from "@/components";

const rankGroups = [
  "Juru Muda (I/a)",
  "Juru Muda Tingkat I (I/b)",
  "Juru (I/c)",
  "Juru Tingkat I (I/d)",
  "Pengatur Muda (II/a)",
  "Pengatur Muda Tingkat I (II/b)",
  "Pengatur (II/c)",
  "Pengatur Tingkat I (II/d)",
  "Penata Muda (III/a)",
  "Penata Muda Tingkat I (III/b)",
  "Penata (III/c)",
  "Penata Tingkat I (III/d)",
  "Pembina (IV/a)",
  "Pembina Tingkat I (IV/b)",
  "Pembina Utama Muda (IV/c)",
  "Pembina Utama Madya (IV/d)",
  "Pembina Utama (IV/e)",
];

export function RegistrationForm({
  skpds,
}: {
  skpds: { id: string; name: string }[];
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function next(form: HTMLFormElement) {
    const fields =
      step === 1
        ? ["name", "nip", "nik", "phone"]
        : ["email", "password", "passwordConfirmation", "consent"];
    if (
      !fields.every(
        (name) =>
          form.elements.namedItem(name) instanceof HTMLInputElement ||
          form.elements.namedItem(name) instanceof HTMLSelectElement,
      )
    )
      return;
    for (const name of fields) {
      const field = form.elements.namedItem(name) as
        HTMLInputElement | HTMLSelectElement;
      if (!field.checkValidity()) {
        field.reportValidity();
        return;
      }
    }
    if (step === 1 && !new FormData(form).get("rankGroup")) {
      setError("Pilih pangkat atau golongan terlebih dahulu.");
      return;
    }
    if (step === 2 && !new FormData(form).get("skpdId")) {
      setError("Pilih instansi terlebih dahulu.");
      return;
    }
    if (
      step === 2 &&
      (form.elements.namedItem("password") as HTMLInputElement).value !==
        (form.elements.namedItem("passwordConfirmation") as HTMLInputElement)
          .value
    ) {
      setError("Konfirmasi kata sandi belum sama.");
      return;
    }
    setError("");
    setStep(2);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      next(event.currentTarget);
      return;
    }
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    if (!data.get("skpdId")) {
      setError("Pilih instansi terlebih dahulu.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = (await response.json()) as {
        error?: string;
        userId?: string;
      };
      if (!response.ok || !result.userId)
        throw new Error(result.error || "Pendaftaran tidak dapat diproses.");
      window.location.assign("/login?registered=1");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Pendaftaran tidak dapat diproses.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <aside className={styles.aside}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <span className={styles.cityLogo}>
              <Image src={cityLogo} alt="Lambang Kota Makassar" />
            </span>
            <span className={styles.anniversaryLogo}>
              <Image src={anniversaryLogo} alt="Logo 418 Tahun Kota Makassar" />
            </span>
          </span>
          <strong>SIPINTER</strong>
        </div>
        <div className={styles.asideBody}>
          <p className={styles.eyebrow}>AKSES PEMINJAM</p>
          <h1>Mulai dengan identitas yang jelas.</h1>
          <p>
            Pendaftaran akun untuk aparatur Pemerintah Kota Makassar yang
            memerlukan fasilitas terintegrasi.
          </p>
        </div>
        <div className={styles.asideFoot}>
          <ShieldCheck size={17} /> Data identitas dilindungi untuk keamanan
          akun.
        </div>
      </aside>
      <section className={styles.content}>
        <div className={styles.top}>
          <Link href="/login" className={styles.back}>
            <ArrowLeft size={16} /> Kembali ke masuk
          </Link>
          <span>
            Sudah terdaftar? <Link href="/login">Masuk</Link>
          </span>
        </div>
        <div className={styles.formWrap}>
          <header>
            <p className={`${styles.eyebrow} ${styles.formEyebrow}`}>
              PENDAFTARAN AKUN
            </p>
            <h2>
              <span className={styles.desktopTitle}>
                Daftar sebagai peminjam
              </span>
              <span className={styles.mobileTitle}>Lengkapi data Anda</span>
            </h2>
            <p className={styles.formDescription}>
              Lengkapi data dengan dokumen identitas Anda. Waktu pengisian
              sekitar 3 menit.
            </p>
          </header>
          <ol className={styles.steps} aria-label="Tahap pendaftaran">
            <li className={step === 1 ? styles.active : styles.done}>
              <span>{step > 1 ? <Check size={14} /> : "1"}</span>
              <div>
                <strong>Identitas pegawai</strong>
                <small>Data dasar dan kontak</small>
              </div>
            </li>
            <li className={step === 2 ? styles.active : ""}>
              <span>2</span>
              <div>
                <strong>Instansi dan akses</strong>
                <small>Unit kerja dan sandi</small>
              </div>
            </li>
          </ol>
          <form onSubmit={submit} noValidate>
            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}
            <div hidden={step !== 1} className={styles.fields}>
              <Field label="Nama lengkap">
                <input
                  name="name"
                  autoComplete="name"
                  minLength={3}
                  maxLength={120}
                  required
                  placeholder="Sesuai identitas kedinasan"
                />
              </Field>
              <Field label="NIP">
                <input
                  name="nip"
                  inputMode="numeric"
                  pattern="[0-9]{18}"
                  autoComplete="off"
                  required
                  placeholder="18 digit NIP"
                />
              </Field>
              <div className={styles.field}>
                <Select label="Pangkat / Golongan" name="rankGroup" required defaultValue="">
                    <option value="" disabled>
                      Pilih pangkat/golongan
                    </option>
                    {rankGroups.map((group) => (
                      <option key={group}>{group}</option>
                    ))}
                </Select>
              </div>
              <Field label="Nomor KTP / NIK">
                <input
                  name="nik"
                  inputMode="numeric"
                  pattern="[0-9]{16}"
                  autoComplete="off"
                  required
                  placeholder="16 digit NIK"
                />
              </Field>
              <Field label="Nomor telepon">
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  pattern="(?:\+62|62|0)8[0-9]{7,12}"
                  autoComplete="tel"
                  required
                  placeholder="Contoh: 081234567890"
                />
              </Field>
            </div>
            <div hidden={step !== 2} className={styles.fields}>
              <div className={styles.field}>
                <Select label="Nama instansi / SKPD" name="skpdId" required defaultValue="">
                    <option value="" disabled>
                      Pilih instansi
                    </option>
                    {skpds.map((skpd) => (
                      <option value={skpd.id} key={skpd.id}>
                        {skpd.name}
                      </option>
                    ))}
                </Select>
              </div>
              <Field label="Email kedinasan">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nama@makassarkota.go.id"
                />
              </Field>
              <Field label="Kata sandi">
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="Minimal 8 karakter"
                />
                <small>Gunakan huruf besar, huruf kecil, dan angka.</small>
              </Field>
              <Field label="Konfirmasi kata sandi">
                <input
                  name="passwordConfirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Ulangi kata sandi"
                />
              </Field>
              <label className={styles.consent}>
                <input name="consent" type="checkbox" required />
                <span>
                  Saya menyetujui penggunaan data untuk pembuatan akun SIPINTER.
                </span>
              </label>
            </div>
            <div className={styles.actions}>
              {step === 2 && (
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                >
                  <ArrowLeft size={17} /> Kembali
                </button>
              )}
              <button className={styles.primary} disabled={loading}>
                {step === 1 ? (
                  <>
                    Lanjutkan <ArrowRight size={17} />
                  </>
                ) : (
                  <>
                    {loading ? "Membuat akun..." : "Buat akun"}{" "}
                    <LockKeyhole size={17} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}
