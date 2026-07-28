import { PageHeader } from "@/components";
import { RequestList } from "@/components/borrower/borrower-ui";
import styles from "@/components/borrower/borrower.module.css";
import { BorrowingStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { HistoryFilters } from "@/components/borrower/request-filters";

const historyStatuses: BorrowingStatus[] = [BorrowingStatus.COMPLETED, BorrowingStatus.CANCELLED, BorrowingStatus.REJECTED];

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ year?: string; status?: string }> }) {
  const [user, params] = await Promise.all([requireRole([Role.BORROWER]), searchParams]);
  const status = params.status && historyStatuses.includes(params.status as BorrowingStatus) ? params.status as BorrowingStatus : "all";
  const requests = await db.borrowingRequest.findMany({ where: { borrowerId: user.id, status: status === "all" ? { in: historyStatuses } : status }, include: { borrower: { include: { skpd: true } }, items: { include: { item: true } } }, orderBy: { updatedAt: "desc" } });
  const years = [...new Set(requests.map((request) => String(request.updatedAt.getFullYear())))].sort((a, b) => Number(b) - Number(a));
  const year = params.year && years.includes(params.year) ? params.year : "all";
  const history = year === "all" ? requests : requests.filter((request) => String(request.updatedAt.getFullYear()) === year);
  return <div className={styles.page}><PageHeader title="Riwayat Peminjaman" description="Rekam pengajuan yang telah selesai, ditolak, atau dibatalkan." /><HistoryFilters year={year} status={status} years={years} /><RequestList requests={history.map(toBorrowerRequest)} /></div>;
}
