import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Building2, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { roleHome, roleLabels } from "@/lib/navigation";
import { LogoutButton } from "./logout-button";
import styles from "./profile.module.css";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect("/sesi-berakhir");
  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      nip: true,
      phone: true,
      rankGroup: true,
      skpd: { select: { name: true } },
    },
  });
  if (!profile) redirect("/sesi-berakhir");
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.top}>
          <div>
            <p className={styles.eyebrow}>AKUN PENGGUNA</p>
            <h1>Profil</h1>
            <p>Identitas kedinasan dan akses aktif SIPINTER.</p>
          </div>
          <Link className={styles.back} href={roleHome[user.role]}>
            <ArrowLeft size={16} /> Kembali ke beranda
          </Link>
        </header>
        <section className={styles.masthead}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.mastheadIdentity}>
            <span>IDENTITAS TERKONFIRMASI</span>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
          </div>
          <span className={styles.role}>{roleLabels[user.role]}</span>
        </section>
        <div className={styles.layout}>
          <section className={styles.record} aria-labelledby="identity-title">
            <header>
              <div>
                <p>DATA KEDINASAN</p>
                <h2 id="identity-title">Identitas kedinasan</h2>
              </div>
            </header>
            <dl className={styles.details}>
              <div>
                <dt>Nama lengkap</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>NIP</dt>
                <dd>{profile.nip}</dd>
              </div>
              <div>
                <dt>Email kedinasan</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>Nomor telepon</dt>
                <dd>{profile.phone || "Belum tercatat"}</dd>
              </div>
              <div>
                <dt>Pangkat / golongan</dt>
                <dd>{profile.rankGroup || "Belum tercatat"}</dd>
              </div>
              <div>
                <dt>Perangkat daerah</dt>
                <dd>{profile.skpd.name}</dd>
              </div>
            </dl>
          </section>
          <aside className={styles.side}>
            <section className={styles.access}>
              <span className={styles.accessIcon}>
                <Building2 size={20} />
              </span>
              <p>AKSES AKTIF</p>
              <h2>{roleLabels[user.role]}</h2>
              <span>
                Anda sedang menggunakan ruang kerja sesuai peran akses akun.
              </span>
            </section>
            <section className={styles.session}>
              <span className={styles.sessionIcon}>
                <ShieldCheck size={20} />
              </span>
              <div>
                <p>SESI & KEAMANAN</p>
                <h2>Akhiri sesi perangkat ini</h2>
                <span>
                  Gunakan saat selesai memakai SIPINTER pada perangkat bersama.
                </span>
              </div>
              <LogoutButton />
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
