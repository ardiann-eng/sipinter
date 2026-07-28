import { Badge, DetailGrid, DetailItem, PageHeader, Panel } from "@/components";
import styles from "@/components/borrower/borrower.module.css";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { ProfileContactForm } from "@/components/borrower/profile-contact-form";

export default async function ProfilePage() {
  const user = await requireRole([Role.BORROWER]);
  const profile = await db.user.findUniqueOrThrow({ where: { id: user.id }, include: { skpd: true } });
  const initials = profile.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <div className={styles.page}><PageHeader title="Profil" description="Identitas pegawai bersumber dari data kepegawaian. Hubungi administrator bila terdapat kekeliruan." /><div className={styles.grid}><Panel className={styles.span5}><div className={styles.profileHead}><div className={styles.avatar}>{initials}</div><div><h2>{profile.name}</h2><p>{profile.position}</p><Badge tone="success" dot>Akun aktif</Badge></div></div></Panel><Panel className={styles.span7} title="Identitas pegawai"><DetailGrid><DetailItem label="Nama lengkap">{profile.name}</DetailItem><DetailItem label="NIP">{profile.nip}</DetailItem><DetailItem label="Pangkat / golongan">{profile.rankGroup ?? "Belum tercatat"}</DetailItem><DetailItem label="Perangkat daerah">{profile.skpd.name}</DetailItem><DetailItem label="Jabatan" wide>{profile.position}</DetailItem></DetailGrid></Panel><Panel className={styles.span12} title="Kontak" description="Kontak dipakai untuk pemberitahuan status dan pengingat pengembalian."><ProfileContactForm email={profile.email} phone={profile.phone} /></Panel></div></div>;
}
