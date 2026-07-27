import { AlertCircle, CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import { ApprovalRecords, pendingApprovals } from "@/components/approver";
import { PageHeader } from "@/components";

export const metadata = { title: "Menunggu Persetujuan" };

export default function PendingApprovalsPage() {
  return <div className="sekda-page">
    <PageHeader eyebrow="Meja persetujuan Sekretaris Daerah" title="Menunggu Persetujuan" description="Telaah dan putuskan permohonan fasilitas yang telah lolos verifikasi administrator." />
    <section className="approval-summary" aria-label="Ringkasan persetujuan">
      <div><Clock3 /><span><strong>4</strong>Menunggu keputusan</span></div>
      <div><AlertCircle /><span><strong>1</strong>Perlu diputus hari ini</span></div>
      <div><CalendarClock /><span><strong>3</strong>Kegiatan 7 hari ke depan</span></div>
      <div><CheckCircle2 /><span><strong>18</strong>Diputus bulan ini</span></div>
    </section>
    <div className="queue-context"><p><strong>Antrean aktif</strong> Seluruh permohonan telah diperiksa administrator. Prioritaskan kegiatan dengan tanggal penggunaan terdekat.</p><time>Pembaruan terakhir: 18 Juli 2026, 10.30 WITA</time></div>
    <ApprovalRecords records={pendingApprovals} />
  </div>;
}
