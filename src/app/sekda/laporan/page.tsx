import { BarChart3, CalendarDays, CheckCircle2, Clock3, TrendingDown, XCircle } from "lucide-react";
import { Badge, PageHeader, Panel, Stat } from "@/components";

export const metadata = { title: "Laporan Persetujuan" };

const units = [
  ["Sekretariat Daerah", "8", "7", "1"], ["Dinas Kesehatan", "5", "5", "0"], ["Dinas Pendidikan", "4", "3", "1"], ["Dinas Komunikasi dan Informatika", "3", "3", "0"], ["Bappeda", "2", "2", "0"],
];

export default function ApprovalReportPage() {
  return <div className="sekda-page"><PageHeader eyebrow="Ringkasan eksekutif" title="Laporan Persetujuan" description="Gambaran kinerja persetujuan penggunaan fasilitas untuk mendukung pengambilan keputusan Sekretaris Daerah." actions={<Badge tone="neutral"><CalendarDays size={13} />Juli 2026</Badge>} />
    <div className="report-stats"><Stat label="Permohonan ditelaah" value="22" detail="18 selesai, 4 masih menunggu" icon={<BarChart3 size={19} />} tone="maroon" /><Stat label="Disetujui" value="16" detail="88,9% dari keputusan selesai" icon={<CheckCircle2 size={19} />} tone="primary" /><Stat label="Ditolak" value="2" detail="Keduanya karena benturan jadwal" icon={<XCircle size={19} />} tone="red" /><Stat label="Median waktu keputusan" value="3j 24m" detail="Turun 42 menit dari Juni" icon={<Clock3 size={19} />} /></div>
    <div className="report-grid"><Panel title="Volume permohonan per pekan" description="Permohonan masuk dan keputusan selesai selama Juli 2026"><div className="weekly-bars" aria-label="Grafik volume mingguan">{[["1-5 Jul", 4, 4], ["6-12 Jul", 7, 6], ["13-19 Jul", 11, 8], ["20-26 Jul", 0, 0]].map(([label, incoming, done]) => <div key={label}><span>{label}</span><div><i style={{ height: `${Number(incoming) * 9}px` }} title={`${incoming} masuk`} /><i style={{ height: `${Number(done) * 9}px` }} title={`${done} selesai`} /></div><small>{incoming} masuk</small></div>)}</div><div className="chart-legend"><span><i />Masuk</span><span><i />Selesai</span></div></Panel>
      <Panel title="Catatan untuk perhatian" description="Indikator yang memerlukan pemantauan pimpinan"><div className="insight-list"><article><TrendingDown /><div><strong>Waktu telaah membaik 17%</strong><p>Median waktu keputusan turun dari 4 jam 6 menit pada Juni menjadi 3 jam 24 menit.</p></div></article><article><CalendarDays /><div><strong>Benturan jadwal menjadi alasan penolakan utama</strong><p>Dua permohonan ditolak karena fasilitas telah dialokasikan untuk agenda resmi pada tanggal sama.</p></div></article><article><Clock3 /><div><strong>Satu keputusan perlu diselesaikan hari ini</strong><p>Permohonan rapat koordinasi 22 Juli memiliki waktu persiapan tersisa tiga hari kerja.</p></div></article></div></Panel></div>
    <Panel title="Permohonan menurut perangkat daerah" description="Distribusi 22 permohonan yang masuk pada Juli 2026" flush><div className="report-unit-table"><div><b>Perangkat daerah</b><b>Masuk</b><b>Disetujui</b><b>Ditolak</b></div>{units.map((unit) => <div key={unit[0]}><strong>{unit[0]}</strong><span>{unit[1]}</span><span>{unit[2]}</span><span>{unit[3]}</span></div>)}</div></Panel>
  </div>;
}
