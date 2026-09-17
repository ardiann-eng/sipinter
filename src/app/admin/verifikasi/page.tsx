import { EmptyState } from "@/components";
import { AdminHeader, Panel, RequestTable, s } from "@/components/admin/admin-ui";
import { requireRole } from "@/lib/auth";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { db } from "@/lib/db";
import { BorrowingStatus, Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  await requireRole([Role.ADMIN]);
  const records = await db.borrowingRequest.findMany({
    where: { status: BorrowingStatus.WAITING_ADMIN_VERIFICATION },
    include: {
      borrower: { include: { skpd: true } },
      items: { include: { item: true } },
    },
    orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
  });
  const requests = records.map(toBorrowerRequest);
  const countLabel = `${requests.length} permohonan membutuhkan tindakan`;

  return (
    <>
      <AdminHeader
        title="Verifikasi peminjaman"
        description="Periksa kelengkapan, kesesuaian kebutuhan, dan ketersediaan barang sebelum diteruskan kepada Sekretaris Daerah."
      />
      <section className={s.summaryStrip} aria-label="Ringkasan antrean">
        <div className={s.summaryItem}>
          <span>Menunggu verifikasi</span>
          <strong>{requests.length}</strong>
          <small>Permohonan perlu tindakan admin</small>
        </div>
      </section>
      <div className={s.note}>
        <strong>Standar layanan:</strong> Verifikasi administratif maksimal 1
        hari kerja sejak pengajuan diterima.
      </div>
      <Panel title="Antrean verifikasi" description={countLabel} flush>
        {requests.length ? (
          <RequestTable requests={requests} />
        ) : (
          <EmptyState
            title="Antrean verifikasi kosong"
            description="Belum ada pengajuan peminjaman baru yang perlu diperiksa."
          />
        )}
      </Panel>
    </>
  );
}
