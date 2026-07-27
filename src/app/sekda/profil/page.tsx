import { Building2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Badge, DetailGrid, DetailItem, PageHeader, Panel } from "@/components";

export const metadata = { title: "Profil Sekretaris Daerah" };

export default function ProfilePage() {
  return <div className="sekda-page"><PageHeader eyebrow="Akun pengguna" title="Profil" description="Informasi identitas dan kewenangan akun Sekretaris Daerah pada SIPINTER." />
    <div className="profile-layout"><Panel><div className="profile-card"><div className="profile-card__avatar">MA</div><div><Badge tone="maroon">Sekretaris Daerah</Badge><h2>M. Ansar, S.E., M.Si.</h2><p>NIP 19691231 199903 1 014</p></div></div></Panel>
      <Panel title="Informasi kedinasan"><DetailGrid><DetailItem label="Jabatan">Sekretaris Daerah Kota Makassar</DetailItem><DetailItem label="Perangkat daerah">Sekretariat Daerah Kota Makassar</DetailItem><DetailItem label="Unit kerja">Sekretaris Daerah</DetailItem><DetailItem label="Email kedinasan">sekda@makassarkota.go.id</DetailItem><DetailItem label="Status akun"><Badge tone="success" dot>Aktif</Badge></DetailItem><DetailItem label="Terakhir masuk">18 Juli 2026, 08.02 WITA</DetailItem></DetailGrid></Panel></div>
    <div className="profile-info-grid"><article><UserRound /><div><strong>Identitas terverifikasi</strong><p>Data akun terhubung dengan identitas pegawai Pemerintah Kota Makassar.</p></div></article><article><Building2 /><div><strong>Lingkup kewenangan</strong><p>Menelaah keputusan penggunaan fasilitas lintas perangkat daerah.</p></div></article><article><Mail /><div><strong>Notifikasi kedinasan</strong><p>Pemberitahuan antrean dan keputusan dikirim ke email kedinasan.</p></div></article><article><ShieldCheck /><div><strong>Jejak audit aktif</strong><p>Aktivitas persetujuan direkam untuk akuntabilitas dan pemeriksaan.</p></div></article></div>
  </div>;
}
