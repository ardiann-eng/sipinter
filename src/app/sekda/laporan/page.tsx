import { ApprovalDecision, BorrowingStatus, Role } from "@prisma/client";
import { BarChart3, CalendarDays, CheckCircle2, Clock3, TriangleAlert, XCircle } from "lucide-react";
import { Badge, PageHeader, Panel, Stat } from "@/components";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Laporan Persetujuan" };

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function durationLabel(milliseconds: number) {
  if (!milliseconds) return "Belum ada data";
  const minutes = Math.round(milliseconds / 60_000);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}j ${minutes % 60}m` : `${minutes} menit`;
}

export default async function ApprovalReportPage() {
  await requireRole([Role.APPROVER]);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(now);
  const [reviewed, decisions, pending] = await Promise.all([
    db.borrowingRequest.findMany({ where: { verifiedAt: { gte: start, lt: end } }, include: { borrower: { include: { skpd: true } }, approvalRecords: true } }),
    db.approvalRecord.findMany({ where: { decidedAt: { gte: start, lt: end } }, include: { borrowingRequest: { select: { verifiedAt: true } } }, orderBy: { decidedAt: "asc" } }),
    db.borrowingRequest.findMany({ where: { status: BorrowingStatus.WAITING_SEKDA_APPROVAL }, select: { borrowDate: true } }),
  ]);
  const approved = decisions.filter((record) => record.decision === ApprovalDecision.APPROVED).length;
  const rejected = decisions.length - approved;
  const approvalRate = decisions.length ? Math.round((approved / decisions.length) * 1000) / 10 : 0;
  const medianDecisionTime = median(decisions.flatMap((record) => record.borrowingRequest.verifiedAt ? [record.decidedAt.getTime() - record.borrowingRequest.verifiedAt.getTime()] : []));
  const dueSoon = pending.filter((request) => request.borrowDate.getTime() <= now.getTime() + 3 * 86_400_000).length;

  const weekCount = Math.ceil(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() / 7);
  const weekly = Array.from({ length: weekCount }, (_, index) => ({ label: `${index * 7 + 1}-${Math.min((index + 1) * 7, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`, incoming: 0, done: 0 }));
  reviewed.forEach((request) => { if (request.verifiedAt) weekly[Math.floor((request.verifiedAt.getDate() - 1) / 7)].incoming += 1; });
  decisions.forEach((record) => { weekly[Math.floor((record.decidedAt.getDate() - 1) / 7)].done += 1; });
  const maxWeekly = Math.max(1, ...weekly.flatMap((week) => [week.incoming, week.done]));

  const unitMap = new Map<string, { incoming: number; approved: number; rejected: number }>();
  reviewed.forEach((request) => {
    const unit = unitMap.get(request.borrower.skpd.name) ?? { incoming: 0, approved: 0, rejected: 0 };
    unit.incoming += 1;
    const latest = [...request.approvalRecords].sort((left, right) => right.decidedAt.getTime() - left.decidedAt.getTime())[0];
    if (latest?.decision === ApprovalDecision.APPROVED) unit.approved += 1;
    if (latest?.decision === ApprovalDecision.REJECTED) unit.rejected += 1;
    unitMap.set(request.borrower.skpd.name, unit);
  });
  const units = [...unitMap.entries()].sort((left, right) => right[1].incoming - left[1].incoming);

  return <div className="sekda-page"><PageHeader eyebrow="Ringkasan eksekutif" title="Laporan Persetujuan" description="Gambaran kinerja persetujuan penggunaan kendaraan dinas berdasarkan data SIPINTER." actions={<Badge tone="neutral"><CalendarDays size={13} />{monthLabel}</Badge>} />
    <div className="report-stats"><Stat label="Permohonan ditelaah" value={String(reviewed.length)} detail={`${decisions.length} keputusan selesai, ${pending.length} masih menunggu`} icon={<BarChart3 size={19} />} tone="maroon" /><Stat label="Disetujui" value={String(approved)} detail={`${approvalRate.toLocaleString("id-ID")}% dari keputusan selesai`} icon={<CheckCircle2 size={19} />} tone="primary" /><Stat label="Ditolak" value={String(rejected)} detail="Berdasarkan keputusan yang tercatat" icon={<XCircle size={19} />} tone="red" /><Stat label="Median waktu keputusan" value={durationLabel(medianDecisionTime)} detail="Dihitung sejak verifikasi admin" icon={<Clock3 size={19} />} /></div>
    <div className="report-grid"><Panel title="Volume permohonan per pekan" description={`Permohonan diverifikasi dan keputusan selesai selama ${monthLabel}`}><div className="weekly-bars" style={{ gridTemplateColumns: `repeat(${weekly.length}, 1fr)` }} aria-label="Grafik volume mingguan">{weekly.map((week) => <div key={week.label}><span>{week.label}</span><div><i style={{ height: `${Math.max(2, (week.incoming / maxWeekly) * 100)}px` }} title={`${week.incoming} masuk`} /><i style={{ height: `${Math.max(2, (week.done / maxWeekly) * 100)}px` }} title={`${week.done} selesai`} /></div><small>{week.incoming} masuk</small></div>)}</div><div className="chart-legend"><span><i />Masuk</span><span><i />Selesai</span></div></Panel>
      <Panel title="Catatan untuk perhatian" description="Indikator operasional dari data terkini"><div className="insight-list"><article><Clock3 /><div><strong>{pending.length} permohonan masih menunggu</strong><p>{dueSoon ? `${dueSoon} di antaranya mulai dalam tiga hari atau sudah melewati tanggal mulai.` : "Belum ada permohonan mendesak dalam tiga hari ke depan."}</p></div></article><article><CheckCircle2 /><div><strong>Tingkat persetujuan {approvalRate.toLocaleString("id-ID")}%</strong><p>{approved} dari {decisions.length} keputusan bulan ini disetujui.</p></div></article><article><TriangleAlert /><div><strong>{rejected} permohonan ditolak</strong><p>Alasan lengkap keputusan dapat ditelusuri pada halaman riwayat persetujuan.</p></div></article></div></Panel></div>
    <Panel title="Permohonan menurut perangkat daerah" description={`Distribusi ${reviewed.length} permohonan yang diverifikasi pada ${monthLabel}`} flush><div className="report-unit-table"><div><b>Perangkat daerah</b><b>Masuk</b><b>Disetujui</b><b>Ditolak</b></div>{units.map(([name, unit]) => <div key={name}><strong>{name}</strong><span>{unit.incoming}</span><span>{unit.approved}</span><span>{unit.rejected}</span></div>)}</div>{!units.length && <p className="report-empty">Belum ada data persetujuan pada bulan ini.</p>}</Panel>
  </div>;
}
