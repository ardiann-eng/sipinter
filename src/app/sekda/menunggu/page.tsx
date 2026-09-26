import { ApprovalRecords } from "@/components/approver";
import { PageHeader } from "@/components";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toApprovalView } from "@/lib/approval-view";
import { APP_STARTED_AT } from "@/lib/app-start";
import { BorrowingStatus, Role } from "@prisma/client";

export const metadata = { title: "Menunggu Persetujuan" };

export default async function PendingApprovalsPage() {
  await requireRole([Role.APPROVER]);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const nextSevenDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8);
  const calendarStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonth = calendarStart > APP_STARTED_AT ? calendarStart : APP_STARTED_AT;
  const [requests, decisionsThisMonth] = await Promise.all([
    db.borrowingRequest.findMany({ where: { status: BorrowingStatus.WAITING_SEKDA_APPROVAL, verifiedAt: { gte: APP_STARTED_AT } }, include: { borrower: { include: { skpd: true } }, items: { include: { item: true } }, approvalRecords: true }, orderBy: { verifiedAt: "asc" } }),
    db.approvalRecord.count({ where: { decidedAt: { gte: startOfMonth } } }),
  ]);
  const records = requests.map(toApprovalView);
  return <div className="sekda-page">
    <PageHeader eyebrow="Meja persetujuan Sekretaris Daerah" title="Menunggu Persetujuan" description="Telaah dan putuskan permohonan kendaraan dinas yang telah lolos verifikasi administrator." />
    <section className="approval-summary" aria-label="Ringkasan persetujuan">
      <div className="approval-summary__lead"><span>Antrean saat ini</span><strong>{records.length}</strong><p>permohonan menunggu keputusan Sekda</p></div>
      <dl className="approval-summary__details">
        <div><dt>Mulai hari ini atau terlewat</dt><dd>{requests.filter((request) => request.borrowDate < endOfToday).length}</dd></div>
        <div><dt>Kegiatan 7 hari ke depan</dt><dd>{requests.filter((request) => request.borrowDate >= startOfToday && request.borrowDate < nextSevenDays).length}</dd></div>
        <div><dt>Diputus bulan ini</dt><dd>{decisionsThisMonth}</dd></div>
      </dl>
    </section>
    <div className="queue-context"><p><strong>Antrean aktif</strong> Seluruh permohonan telah diperiksa administrator. Prioritaskan kegiatan dengan tanggal penggunaan terdekat.</p><time>Pembaruan terakhir: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Makassar" }).format(now)} WITA</time></div>
    <ApprovalRecords records={records} />
  </div>;
}
