import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import {
  Badge,
  DetailGrid,
  DetailItem,
  NotFoundState,
  PageHeader,
  Panel,
  Timeline,
} from "@/components";
import { findBorrowerRequest } from "@/components/borrower/borrower-data";
import { StatusBadge } from "@/components/borrower/borrower-ui";
import { formatDate, formatDateTime } from "@/lib/format";
import styles from "@/components/borrower/borrower.module.css";

export default async function BorrowingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = findBorrowerRequest(id);
  if (!request)
    return (
      <div className={styles.page}>
        <Link
          className={`${styles.linkButton} ${styles.linkGhost}`}
          href="/peminjam/peminjaman"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
        <NotFoundState description="Data peminjaman tidak ditemukan atau bukan milik akun ini." />
      </div>
    );
  const revision = request.status === "REVISION_REQUIRED";
  const returnable = [
    "BORROWED",
    "WAITING_RETURN",
    "OVERDUE",
    "RETURN_PROBLEM",
  ].includes(request.status);
  const nextAction = revision
    ? {
        title: "Perbaikan dokumen diperlukan",
        description:
          request.adminNote ||
          "Periksa kembali dokumen pengajuan sebelum dikirim ulang.",
        label: "Perbaiki pengajuan",
        href: "/peminjam/ajukan",
      }
    : returnable
      ? {
          title: "Fasilitas perlu dikembalikan",
          description: `Ajukan pengembalian paling lambat ${formatDate(request.endDate)}. Siapkan foto kondisi seluruh barang.`,
          label: "Ajukan pengembalian",
          href: `/peminjam/pengembalian/${request.id}`,
        }
      : {
          title: "Pengajuan sedang diproses",
          description:
            "Status akan diperbarui setelah tahapan verifikasi berikutnya selesai.",
        };
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Detail peminjaman"
        title={request.number}
        description={`Diajukan ${formatDateTime(request.submittedAt)} WITA`}
        actions={
          <Link
            className={`${styles.linkButton} ${styles.linkOutline}`}
            href="/peminjam/peminjaman"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>
        }
      />
      <section
        className={styles.statusHero}
        aria-label="Status dan tindakan peminjaman"
      >
        <div>
          <span>STATUS SAAT INI</span>
          <h2>{nextAction.title}</h2>
          <p>{nextAction.description}</p>
        </div>
        <div className={styles.statusHeroAction}>
          <StatusBadge status={request.status} />
          {nextAction.href && (
            <Link
              className={`${styles.linkButton} ${styles.linkSecondary}`}
              href={nextAction.href}
            >
              {nextAction.label}
            </Link>
          )}
        </div>
      </section>
      <div className={styles.grid}>
        <Panel className={styles.span8}>
          <div className={styles.detailHero}>
            <div>
              <h2>{request.purpose}</h2>
              <p className={styles.muted}>{request.location}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <DetailGrid>
            <DetailItem label="Peminjam">{request.borrowerName}</DetailItem>
            <DetailItem label="NIP">{request.borrowerNip ?? "-"}</DetailItem>
            <DetailItem label="Perangkat daerah">{request.skpd}</DetailItem>
            <DetailItem label="Unit kerja">{request.unit}</DetailItem>
            <DetailItem label="Mulai">
              {formatDate(request.startDate)}
            </DetailItem>
            <DetailItem label="Selesai">
              {formatDate(request.endDate)}
            </DetailItem>
            <DetailItem label="Keperluan" wide>
              {request.purpose}
            </DetailItem>
            <DetailItem label="Lokasi kegiatan" wide>
              {request.location}
            </DetailItem>
          </DetailGrid>
        </Panel>
        <Panel className={styles.span4} title="Alur persetujuan">
          <Timeline
            items={[
              {
                id: "submitted",
                title: "Pengajuan dikirim",
                timestamp: formatDate(request.submittedAt, "dd MMM, HH.mm"),
                state: "complete",
              },
              {
                id: "admin",
                title: revision ? "Revisi administrasi" : "Verifikasi admin",
                timestamp: revision ? "Perlu tindakan" : "Diproses",
                state: "current",
              },
              {
                id: "approval",
                title: "Persetujuan Sekda",
                timestamp: request.approver ? "Tercatat" : "Berikutnya",
                state: request.approver ? "complete" : "upcoming",
              },
            ]}
          />
        </Panel>
        <Panel
          className={styles.span8}
          title="Barang dipinjam"
          description={`${request.items.length} jenis barang`}
        >
          <div className={styles.itemRows}>
            {request.items.map((item) => (
              <div className={styles.itemRow} key={item.itemId}>
                <div>
                  <strong>{item.itemName}</strong>
                  <small>ID barang: {item.itemId}</small>
                </div>
                <Badge tone="info">{item.quantity} unit</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className={styles.span4} title="Dokumen pengajuan">
          <div className={styles.available}>
            <div className={styles.availableItem}>
              <span className={styles.itemIcon}>
                <FileText size={18} />
              </span>
              <div>
                <strong>Kartu Tanda Penduduk</strong>
                <small>ktp-ahmad.pdf · PDF</small>
              </div>
            </div>
            <div className={styles.availableItem}>
              <span className={styles.itemIcon}>
                <FileText size={18} />
              </span>
              <div>
                <strong>Surat tugas</strong>
                <small>surat-tugas.pdf · PDF</small>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
