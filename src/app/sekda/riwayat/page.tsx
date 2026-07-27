import { ApprovalRecords, approvalHistory } from "@/components/approver";
import { FilterBar, PageHeader, RecordToolbar, Select } from "@/components";

export const metadata = { title: "Riwayat Persetujuan" };

export default function ApprovalHistoryPage() {
  return <div className="sekda-page"><PageHeader eyebrow="Arsip keputusan" title="Riwayat Persetujuan" description="Telusuri keputusan persetujuan fasilitas yang telah dicatat oleh Sekretaris Daerah." />
    <FilterBar searchPlaceholder="Cari nomor, pemohon, atau perangkat daerah"><Select aria-label="Status keputusan" defaultValue="semua"><option value="semua">Semua keputusan</option><option value="disetujui">Disetujui</option><option value="ditolak">Ditolak</option></Select><Select aria-label="Periode" defaultValue="juli"><option value="juli">Juli 2026</option><option value="juni">Juni 2026</option><option value="mei">Mei 2026</option></Select></FilterBar>
    <RecordToolbar total={approvalHistory.length} noun="keputusan ditampilkan" sortOptions={[{ label: "Terbaru diputus", value: "new" }, { label: "Terlama diputus", value: "old" }]} /><ApprovalRecords records={approvalHistory} history /></div>;
}
