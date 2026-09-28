import { Building2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Role } from "@prisma/client";
import { Badge, DetailGrid, DetailItem, PageHeader, Panel } from "@/components";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, initials } from "@/lib/format";

export const metadata = { title: "Profil Sekretaris Daerah" };

export default async function ProfilePage() {
  const session = await requireRole([Role.APPROVER]);
  const user = await db.user.findUniqueOrThrow({ where: { id: session.id }, include: { skpd: true } });
  return <div className="sekda-page"><PageHeader eyebrow="Akun pengguna" title="Profil" description="Informasi identitas dan kewenangan akun Sekretaris Daerah pada SIPINTER." />
    <div className="profile-layout"><Panel><div className="profile-card"><div className="profile-card__avatar" aria-hidden="true">{initials(user.name)}</div><div><Badge tone="maroon">Sekretaris Daerah</Badge><h2>{user.name}</h2><p>NIP {user.nip}</p></div></div></Panel>
      <Panel title="Informasi kedinasan"><DetailGrid><DetailItem label="Jabatan">{user.position}</DetailItem><DetailItem label="Perangkat daerah">{user.skpd.name}</DetailItem><DetailItem label="NIP">{user.nip}</DetailItem><DetailItem label="Email kedinasan">{user.email}</DetailItem><DetailItem label="Status akun"><Badge tone={user.status === "ACTIVE" ? "success" : "neutral"} dot>{user.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</Badge></DetailItem><DetailItem label="Terakhir masuk">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Belum tercatat"}</DetailItem></DetailGrid></Panel></div>
    <div className="profile-info-grid"><article><UserRound /><div><strong>Identitas terverifikasi</strong><p>Data akun terhubung dengan identitas pegawai Pemerintah Kota Makassar.</p></div></article><article><Building2 /><div><strong>Lingkup kewenangan</strong><p>Menelaah keputusan penggunaan kendaraan dinas lintas perangkat daerah.</p></div></article><article><Mail /><div><strong>Notifikasi sistem</strong><p>Pemberitahuan antrean dan keputusan tersedia pada akun SIPINTER.</p></div></article><article><ShieldCheck /><div><strong>Jejak audit aktif</strong><p>Aktivitas persetujuan direkam untuk akuntabilitas dan pemeriksaan.</p></div></article></div>
  </div>;
}
