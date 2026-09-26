export type UserRole = "ADMIN" | "BORROWER" | "APPROVER";

export type NavigationIcon =
  | "dashboard"
  | "inventory"
  | "request"
  | "handover"
  | "return"
  | "users"
  | "audit"
  | "report"
  | "profile"
  | "history"
  | "settings"
  | "more";

export interface NavigationItem {
  label: string;
  href: string;
  icon: NavigationIcon;
  badge?: number;
}

export const navigationByRole: Record<UserRole, NavigationItem[]> = {
  ADMIN: [
    { label: "Ringkasan Operasional", href: "/admin/ringkasan", icon: "dashboard" },
    { label: "Verifikasi Peminjaman", href: "/admin/verifikasi", icon: "request" },
    { label: "Penyerahan Kendaraan", href: "/admin/penyerahan", icon: "handover" },
    { label: "Verifikasi Pengembalian", href: "/admin/pengembalian", icon: "return" },
    { label: "Master Inventaris", href: "/admin/barang", icon: "inventory" },
    { label: "Laporan Penggunaan", href: "/admin/laporan", icon: "report" },
    { label: "Manajemen Pengguna", href: "/admin/pengguna", icon: "users" },
    { label: "Audit Aktivitas", href: "/admin/audit", icon: "audit" },
    { label: "Pengaturan", href: "/admin/pengaturan", icon: "settings" },
  ],
  BORROWER: [
    { label: "Beranda", href: "/peminjam/beranda", icon: "dashboard" },
    { label: "Ajukan Peminjaman", href: "/peminjam/ajukan", icon: "request" },
    { label: "Peminjaman Saya", href: "/peminjam/peminjaman", icon: "inventory" },
    { label: "Pengembalian", href: "/peminjam/pengembalian", icon: "return" },
    { label: "Riwayat", href: "/peminjam/riwayat", icon: "history" },
  ],
  APPROVER: [
    { label: "Menunggu Persetujuan", href: "/sekda/menunggu", icon: "request" },
    { label: "Riwayat Persetujuan", href: "/sekda/riwayat", icon: "history" },
    { label: "Laporan Ringkas", href: "/sekda/laporan", icon: "report" },
  ],
};

export const mobileNavigationByRole: Record<UserRole, NavigationItem[]> = {
  ADMIN: [
    { label: "Ringkasan", href: "/admin/ringkasan", icon: "dashboard" },
    { label: "Tugas", href: "/admin/verifikasi", icon: "request" },
    { label: "Inventaris", href: "/admin/barang", icon: "inventory" },
    { label: "Laporan", href: "/admin/laporan", icon: "report" },
    { label: "Menu", href: "/admin/menu", icon: "more" },
  ],
  BORROWER: [
    { label: "Beranda", href: "/peminjam/beranda", icon: "dashboard" },
    { label: "Ajukan", href: "/peminjam/ajukan", icon: "request" },
    { label: "Peminjaman", href: "/peminjam/peminjaman", icon: "inventory" },
    { label: "Pengembalian", href: "/peminjam/pengembalian", icon: "return" },
  ],
  APPROVER: [
    { label: "Menunggu", href: "/sekda/menunggu", icon: "request" },
    { label: "Riwayat", href: "/sekda/riwayat", icon: "history" },
    { label: "Ringkasan", href: "/sekda/laporan", icon: "report" },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  BORROWER: "Peminjam",
  APPROVER: "Sekretaris Daerah",
};

export const roleHome: Record<UserRole, string> = {
  ADMIN: "/admin/ringkasan",
  BORROWER: "/peminjam/beranda",
  APPROVER: "/sekda/menunggu",
};
