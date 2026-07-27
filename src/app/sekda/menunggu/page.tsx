import { AlertCircle, CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import { ApprovalRecords } from "@/components/approver";
import { PageHeader } from "@/components";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toApprovalView } from "@/lib/approval-view";
import { BorrowingStatus, Role } from "@prisma/client";

export const metadata = { title: "Menunggu Persetujuan" };

export default async function PendingApprovalsPage() {
  await requireRole([Role.APPROVER]);
  const requests = await db.borrowingRequest.findMany({ where: { status: BorrowingStatus.WAITING_SEKDA_APPROVAL }, include: { borrower: { include: { skpd: true } }, items: { include: { item: true } }, approvalRecords: true }, orderBy: { verifiedAt: "asc" } });
  const records = requests.map(toApprovalView);
  return <div className="sekda-page">
    <PageHeader eyebrow="Meja persetujuan Sekretaris Daerah" title="Menunggu Persetujuan" description="Telaah dan putuskan permohonan fasilitas yang telah lolos verifikasi administrator." />
    <section className="approval-summary" aria-label="Ringkasan persetujuan">
       <div><Clock3 /><span><strong>{records.length}</strong>Menunggu keputusan</span></div>
       <div><AlertCircle /><span><strong>{records.filter((record) => record.startDate === new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date())).length}</strong>Perlu diputus hari ini</span></div>
       <div><CalendarClock /><span><strong>{records.filter((record) => new Date(record.startDate).getTime() - Date.now() < 7 * 86_400_000).length}</strong>Kegiatan 7 hari ke depan</span></div>
       <div><CheckCircle2 /><span><strong>—</strong>Diputus bulan ini</span></div>
    </section>
    <div className="queue-context"><p><strong>Antrean aktif</strong> Seluruh permohonan telah diperiksa administrator. Prioritaskan kegiatan dengan tanggal penggunaan terdekat.</p><time>Pembaruan terakhir: 18 Juli 2026, 10.30 WITA</time></div>
     <ApprovalRecords records={records} />
  </div>;
}
