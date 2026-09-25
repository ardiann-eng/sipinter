import Link from "next/link";
import { BorrowingStatus, Role } from "@prisma/client";
import { PageHeader } from "@/components";
import { RequestList } from "@/components/borrower/borrower-ui";
import styles from "@/components/borrower/borrower.module.css";
import { requireRole } from "@/lib/auth";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { db } from "@/lib/db";

const returnStatuses: BorrowingStatus[] = [
  BorrowingStatus.BORROWED,
  BorrowingStatus.OVERDUE,
  BorrowingStatus.WAITING_RETURN_VERIFICATION,
  BorrowingStatus.RETURN_PROBLEM,
];

export default async function ReturnsPage() {
  const user = await requireRole([Role.BORROWER]);
  const requests = await db.borrowingRequest.findMany({
    where: { borrowerId: user.id, status: { in: returnStatuses } },
    include: { borrower: { include: { skpd: true } }, items: { include: { item: true } } },
    orderBy: [{ plannedReturnDate: "asc" }, { updatedAt: "desc" }],
  });
  return <div className={styles.page}>
    <PageHeader title="Pengembalian Kendaraan" description="Kirim bukti kondisi kendaraan paling lambat pada tanggal akhir peminjaman." />
    <RequestList requests={requests.map(toBorrowerRequest)} detailBase="/peminjam/pengembalian" emptyTitle="Tidak ada pengembalian" empty="Tidak ada kendaraan yang perlu dikembalikan atau diperiksa saat ini." emptyAction={<Link className={`${styles.linkButton} ${styles.linkOutline}`} href="/peminjam/riwayat">Lihat riwayat peminjaman</Link>} />
  </div>;
}
