import { AdminHeader, Button, FilterBar, Panel, RequestTable, Select, s } from "@/components/admin/admin-ui";
import { inventoryRequests } from "@/lib/mock-data";

export default function VerificationPage() {
  const requests = [inventoryRequests[0], { ...inventoryRequests[1], id: "borrow-005", number: "SIPINTER/PMK/VII/2026/00129", status: "WAITING_ADMIN_VERIFICATION" as const, borrowerName: "Andi Tenri", purpose: "Bimbingan teknis pengelolaan data sektoral" }];
  return <><AdminHeader title="Verifikasi peminjaman" description="Periksa kelengkapan, kesesuaian kebutuhan, dan ketersediaan barang sebelum diteruskan kepada Sekretaris Daerah." /><FilterBar searchPlaceholder="Cari nomor, pemohon, atau SKPD"><Select aria-label="Status" defaultValue="pending"><option value="pending">Menunggu verifikasi</option><option value="revision">Perlu revisi</option><option value="all">Semua status</option></Select><Select aria-label="Urutan"><option>Tenggat terdekat</option><option>Pengajuan terbaru</option></Select><Button variant="outline">Terapkan</Button></FilterBar><div className={s.note}><strong>Standar layanan:</strong> Verifikasi administratif maksimal 1 hari kerja. Dua pengajuan perlu diproses sebelum pukul 15.00 WITA.</div><Panel title="Antrean verifikasi" description="2 permohonan membutuhkan tindakan" flush><RequestTable requests={requests} /></Panel></>;
}
