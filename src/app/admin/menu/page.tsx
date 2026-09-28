import Link from "next/link";
import { Activity, PackageCheck, RotateCcw, Settings, Users } from "lucide-react";
import { PageHeader, Panel } from "@/components";
import { s } from "@/components/admin/admin-ui";

const modules = [
  { href: "/admin/penyerahan", label: "Penyerahan Kendaraan", detail: "Konfirmasi kendaraan keluar dan bukti serah terima.", icon: PackageCheck },
  { href: "/admin/pengembalian", label: "Verifikasi Pengembalian", detail: "Periksa kondisi, fungsi, dan kelengkapan kendaraan.", icon: RotateCcw },
  { href: "/admin/pengguna", label: "Manajemen Pengguna", detail: "Kelola akun, SKPD, peran, dan status akses.", icon: Users },
  { href: "/admin/audit", label: "Audit Aktivitas", detail: "Telusuri perubahan dan tindakan penting sistem.", icon: Activity },
  { href: "/admin/pengaturan", label: "Pengaturan", detail: "Atur parameter operasional dan keamanan.", icon: Settings },
] as const;

export default function AdminMenuPage() {
  return <>
    <PageHeader eyebrow="Administrasi SIPINTER" title="Menu lainnya" description="Akses modul administrasi dan pengawasan yang tidak tampil pada navigasi bawah." />
    <Panel title="Modul administrasi">
      <div className={s.menuGrid}>
        {modules.map(({ href, label, detail, icon: Icon }) => <Link className={s.menuLink} href={href} key={href}>
          <span><Icon size={20} /></span><div><strong>{label}</strong><small>{detail}</small></div>
        </Link>)}
      </div>
    </Panel>
  </>;
}
