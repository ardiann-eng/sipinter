import Link from "next/link";
import { ApprovalDecision, Prisma, Role } from "@prisma/client";
import { ApprovalRecords } from "@/components/approver";
import { PageHeader, RecordToolbar } from "@/components";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toApprovalView } from "@/lib/approval-view";

export const metadata = { title: "Riwayat Persetujuan" };

function monthRange(value?: string) {
  const current = new Date();
  const fallback = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "") ? value! : fallback;
  const [year, index] = month.split("-").map(Number);
  return { month, start: new Date(year, index - 1, 1), end: new Date(year, index, 1) };
}

export default async function ApprovalHistoryPage({ searchParams }: { searchParams: Promise<{ q?: string; decision?: string; month?: string; sort?: string }> }) {
  const [, params] = await Promise.all([requireRole([Role.APPROVER]), searchParams]);
  const q = params.q?.trim();
  const decision = Object.values(ApprovalDecision).includes(params.decision as ApprovalDecision) ? params.decision as ApprovalDecision : undefined;
  const { month, start, end } = monthRange(params.month);
  const where: Prisma.BorrowingRequestWhereInput = {
    approvalRecords: { some: { ...(decision ? { decision } : {}), decidedAt: { gte: start, lt: end } } },
    ...(q ? { OR: [{ registrationNumber: { contains: q } }, { purpose: { contains: q } }, { borrower: { is: { OR: [{ name: { contains: q } }, { skpd: { is: { name: { contains: q } } } }] } } }] } : {}),
  };
  const requests = await db.borrowingRequest.findMany({
    where,
    include: { borrower: { include: { skpd: true } }, items: { include: { item: true } }, approvalRecords: true },
    orderBy: { updatedAt: params.sort === "old" ? "asc" : "desc" },
  });
  const records = requests.map(toApprovalView);

  return <div className="sekda-page"><PageHeader eyebrow="Arsip keputusan" title="Riwayat Persetujuan" description="Telusuri keputusan penggunaan kendaraan dinas yang telah dicatat oleh Sekretaris Daerah." />
    <form className="filter-bar" method="get"><div className="filter-bar__search"><input name="q" defaultValue={q} aria-label="Cari riwayat persetujuan" placeholder="Cari nomor, pemohon, atau perangkat daerah" /></div><select className="select" name="decision" defaultValue={decision ?? ""} aria-label="Status keputusan"><option value="">Semua keputusan</option><option value="APPROVED">Disetujui</option><option value="REJECTED">Ditolak</option></select><input className="input" type="month" name="month" defaultValue={month} aria-label="Bulan keputusan" /><select className="select" name="sort" defaultValue={params.sort === "old" ? "old" : "new"} aria-label="Urutkan"><option value="new">Terbaru diputus</option><option value="old">Terlama diputus</option></select><button className="button button--secondary" type="submit">Terapkan</button><Link className="button button--ghost" href="/sekda/riwayat">Atur ulang</Link></form>
    <RecordToolbar total={records.length} noun="keputusan ditampilkan" /><ApprovalRecords records={records} history /></div>;
}
