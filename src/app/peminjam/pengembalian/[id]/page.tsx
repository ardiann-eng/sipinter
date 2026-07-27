import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Badge,
  DetailGrid,
  DetailItem,
  NotFoundState,
  PageHeader,
  Panel,
} from "@/components";
import { findBorrowerRequest } from "@/components/borrower/borrower-data";
import { ReturnForm } from "@/components/borrower/return-form";
import { formatDate } from "@/lib/format";
import styles from "@/components/borrower/borrower.module.css";

export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = findBorrowerRequest(id);
  if (
    !request ||
    !["BORROWED", "WAITING_RETURN", "OVERDUE", "RETURN_PROBLEM"].includes(
      request.status,
    )
  )
    return (
      <div className={styles.page}>
        <Link
          className={`${styles.linkButton} ${styles.linkGhost}`}
          href="/peminjam/pengembalian"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
        <NotFoundState description="Peminjaman tidak ditemukan atau belum dapat dikembalikan." />
      </div>
    );
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Pengajuan pengembalian"
        title={request.number}
        description="Dokumentasikan kondisi aktual seluruh barang sebelum dikirim."
        actions={
          <Link
            className={`${styles.linkButton} ${styles.linkOutline}`}
            href="/peminjam/pengembalian"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>
        }
      />
      <Panel title="Ringkasan peminjaman">
        <DetailGrid>
          <DetailItem label="Keperluan" wide>
            {request.purpose}
          </DetailItem>
          <DetailItem label="Periode">
            {formatDate(request.startDate)} - {formatDate(request.endDate)}
          </DetailItem>
          <DetailItem label="Lokasi">{request.location}</DetailItem>
          <DetailItem label="Barang" wide>
            <div className={styles.itemRows}>
              {request.items.map((item) => (
                <div className={styles.itemRow} key={item.itemId}>
                  <strong>{item.itemName}</strong>
                  <Badge tone="info">{item.quantity} unit</Badge>
                </div>
              ))}
            </div>
          </DetailItem>
        </DetailGrid>
      </Panel>
      <ReturnForm request={request} />
    </div>
  );
}
