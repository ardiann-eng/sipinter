"use client";

import { FormEvent, Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Headphones,
  KeyRound,
  LoaderCircle,
  UserRoundPlus,
} from "lucide-react";
import anniversaryLogo from "../../../images.png";
import loginBackground from "../../../bg.png";
import cityLogo from "../../../logo-makassarkota-239x300.png";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className={styles.page} />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: data.get("identifier"),
          password: data.get("password"),
          remember: data.get("remember") === "on",
          callbackUrl: new URLSearchParams(window.location.search).get(
            "callbackUrl",
          ),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };
      if (!response.ok || !result.redirectTo)
        throw new Error(result.error || "Login gagal diproses.");
      window.location.assign(result.redirectTo);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Login gagal diproses.",
      );
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.identity} aria-labelledby="brand-title">
        <Image
          className={styles.background}
          src={loginBackground}
          alt=""
          fill
          priority
          sizes="54vw"
        />
        <div className={styles.overlay} aria-hidden="true" />
        <div className={styles.identityTop}>
          <LogoGroup className={styles.logo} />
          <div>
            <span>PEMERINTAH KOTA MAKASSAR</span>
            <small>SEKRETARIAT DAERAH</small>
          </div>
        </div>
        <div className={styles.identityBody}>
          <p className={styles.kicker}>LAYANAN INTERNAL PEMERINTAHAN</p>
          <h1 id="brand-title">SIPINTER</h1>
          <p className={styles.fullName}>
            Sistem Informasi Peminjaman Inventaris Kantor Terintegrasi
          </p>
          <p className={styles.statement}>
            Peminjaman fasilitas pemerintah yang tertib, transparan, dan dapat
            ditelusuri.
          </p>
        </div>
        <p className={styles.identityFoot}>
          Dikelola oleh Pemerintah Kota Makassar
        </p>
      </section>

      <section className={styles.access}>
        <div className={styles.card}>
          <div className={styles.mobileBrand}>
            <LogoGroup className={styles.mobileLogo} />
            <div>
              <strong>SIPINTER</strong>
              <span>Pemerintah Kota Makassar</span>
            </div>
          </div>
          <div className={styles.heading}>
            <h2>
              Masuk ke <strong>SIPINTER</strong>
            </h2>
          </div>
          <p className={styles.intro}>
            Gunakan NIP atau email kedinasan dan kata sandi akun Anda.
          </p>
          {searchParams.get("registered") === "1" && (
            <div className={styles.notice} role="status">
              Pendaftaran berhasil. Gunakan email atau NIP dan kata sandi Anda
              untuk masuk.
            </div>
          )}
          <form onSubmit={submit} className={styles.form}>
            {error && (
              <div className={styles.error} role="alert" aria-live="assertive">
                {error}
              </div>
            )}
            <label>
              <span>NIP atau email kedinasan</span>
              <input
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="Contoh: 198001012005011001"
                required
                autoFocus
              />
            </label>
            <label>
              <span>Kata sandi</span>
              <div className={styles.password}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            <div className={styles.options}>
              <label className={styles.check}>
                <input name="remember" type="checkbox" />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <a href="mailto:helpdesk@makassarkota.go.id?subject=Reset%20kata%20sandi%20SIPINTER">
                Lupa kata sandi?
              </a>
            </div>
            <button
              className={styles.submit}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <LoaderCircle
                  className={styles.spin}
                  size={19}
                  aria-hidden="true"
                />
              ) : (
                <KeyRound size={18} aria-hidden="true" />
              )}
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
          <div className={styles.register}>
            <span className={styles.registerIcon}>
              <UserRoundPlus size={18} />
            </span>
            <div>
              <strong>Belum memiliki akun?</strong>
              <span>
                Daftar sebagai peminjam untuk langsung menggunakan SIPINTER.
              </span>
            </div>
            <Link href="/daftar">Daftar</Link>
          </div>
          <div className={styles.help}>
            <Headphones size={20} />
            <div>
              <strong>Butuh bantuan akses?</strong>
              <span>Helpdesk TIK: helpdesk@makassarkota.go.id</span>
            </div>
          </div>
          <p className={styles.security}>
            Akses terbatas untuk pengguna berwenang. Aktivitas dicatat untuk
            kepentingan keamanan dan audit.
          </p>
        </div>
        <footer>
          Versi {process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0-mvp"}{" "}
          <span>•</span> © {new Date().getFullYear()} Pemerintah Kota Makassar
        </footer>
      </section>
    </main>
  );
}

function LogoGroup({ className }: { className: string }) {
  return (
    <div
      className={className}
      aria-label="Logo Pemerintah Kota Makassar dan 418 Tahun Kota Makassar"
    >
      <span className={styles.cityLogo}>
        <Image src={cityLogo} alt="Lambang Kota Makassar" />
      </span>
      <span className={styles.anniversaryLogo}>
        <Image src={anniversaryLogo} alt="Logo 418 Tahun Kota Makassar" />
      </span>
    </div>
  );
}
