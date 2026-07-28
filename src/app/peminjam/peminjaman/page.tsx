import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components";
import { RequestList } from "@/components/borrower/borrower-ui";
import styles from "@/components/borrower/borrower.module.css";
import { BorrowingStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { BorrowingFilters } from "@/components/borrower/request-filters";

const terminalStatuses: BorrowingStatus[] = [BorrowingStatus.COMPLETED, BorrowingStatus.CANCELLED, BorrowingStatus.REJECTED];

export default async function BorrowingsPage({ searchParams }: { searchParams: Promise<{ status?: string; sort?: string }> }) {
  const [user, params] = await Promise.all([requireRole([Role.BORROWER]), searchParams]);
  const status = params.status && Object.values(BorrowingStatus).includes(params.status as BorrowingStatus) && !terminalStatuses.includes(params.status as BorrowingStatus) ? params.status as BorrowingStatus : "all";
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const requests = await db.borrowingRequest.findMany({ where: { borrowerId: user.id, status: status === "all" ? { notIn: terminalStatuses } : status }, include: { borrower: { include: { skpd: true } }, items: { include: { item: true } } }, orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" } });
  return <div className={styles.page}><PageHeader title="Peminjaman Saya" description="Pantau status, jadwal, dan rincian seluruh pengajuan yang masih berjalan." actions={<Link className={`${styles.linkButton} ${styles.linkPrimary}`} href="/peminjam/ajukan"><Plus size={16} /> Ajukan peminjaman</Link>} /><BorrowingFilters status={status} sort={sort} /><RequestList requests={requests.map(toBorrowerRequest)} emptyAction={<Link className={`${styles.linkButton} ${styles.linkPrimary}`} href="/peminjam/ajukan"><Plus size={16} /> Ajukan peminjaman</Link>} /></div>;
}
