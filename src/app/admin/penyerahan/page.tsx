import { BorrowingStatus, Role } from "@prisma/client";
import { EmptyState } from "@/components";
import { AdminHeader, Panel, RequestIdentity, Status, s } from "@/components/admin/admin-ui";
import { HandoverActions } from "@/components/admin/handover-actions";
import { requireRole } from "@/lib/auth";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HandoverPage() {
  await requireRole([Role.ADMIN]);
  const requests = await db.borrowingRequest.findMany({
    where: { status: { in: [BorrowingStatus.APPROVED, BorrowingStatus.READY_FOR_HANDOVER] } },
    include: { borrower: { include: { skpd: true } }, items: { include: { item: true } } },
    orderBy: [{ borrowDate: "asc" }, { approvedAt: "asc" }],
  });
  const approved = requests.filter((request) => request.status === BorrowingStatus.APPROVED).length;
  const ready = requests.length - approved;

  return <>
    <AdminHeader title="Penyerahan kendaraan" description="Siapkan kendaraan yang telah disetujui, lalu catat bukti serah terima saat unit keluar dari pool." />
    <section className={s.summaryStrip} aria-label="Ringkasan penyerahan">
      <div className={s.summaryItem}><span>Disetujui</span><strong>{approved}</strong><small>Perlu disiapkan</small></div>
      <div className={s.summaryItem}><span>Siap diserahkan</span><strong>{ready}</strong><small>Menunggu serah terima fisik</small></div>
    </section>
    <div className={s.stack}>
      {requests.length ? requests.map((request) => {
        const view = toBorrowerRequest(request);
        return <Panel key={request.id} title={request.registrationNumber} description={`${request.borrower.name} · ${request.borrower.skpd.name}`} action={<Status value={request.status} />}>
          <div className={s.grid7030}>
            <div className={s.stack}>
              <RequestIdentity request={view} />
              <div className={s.note}><strong>Kendaraan:</strong>{" "}{request.items.map((entry) => `${entry.item.name} (${entry.item.registrationNumber ?? entry.item.itemCode})`).join(", ")}</div>
            </div>
            <HandoverActions requestId={request.id} status={request.status === BorrowingStatus.APPROVED ? BorrowingStatus.APPROVED : BorrowingStatus.READY_FOR_HANDOVER} borrowerName={request.borrower.name} borrowerNip={request.borrower.nip} />
          </div>
        </Panel>;
      }) : <Panel title="Antrean penyerahan"><EmptyState title="Belum ada kendaraan yang perlu diserahkan" description="Permohonan yang disetujui Sekretaris Daerah akan muncul di sini." /></Panel>}
    </div>
  </>;
}
