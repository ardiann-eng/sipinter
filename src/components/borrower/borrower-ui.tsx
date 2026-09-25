import Link from "next/link";
import {
  MobileRecord,
  EmptyState,
  Panel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  statusTone,
} from "@/components";
import { formatDate } from "@/lib/format";
import { requestStatusLabels, type InventoryRequest, type RequestStatus } from "@/lib/view-models";
import styles from "./borrower.module.css";

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={styles.status} data-tone={statusTone[status]}>
      {requestStatusLabels[status]}
    </span>
  );
}

function statusAction(status: RequestStatus) {
  if (status === "REVISION_REQUIRED") return "Perbaiki dokumen";
  if (
    ["BORROWED", "WAITING_RETURN", "OVERDUE", "RETURN_PROBLEM"].includes(status)
  )
    return "Siapkan pengembalian";
  if (
    [
      "WAITING_ADMIN_VERIFICATION",
      "WAITING_SEKDA_APPROVAL",
      "WAITING_RETURN_VERIFICATION",
    ].includes(status)
  )
    return "Tidak ada tindakan dari Anda";
  if (status === "READY_FOR_HANDOVER") return "Tunggu jadwal penyerahan";
  return "Proses selesai";
}

export function RequestList({
  requests,
  detailBase = "/peminjam/peminjaman",
  emptyTitle = "Belum ada pengajuan",
  empty = "Belum ada peminjaman.",
  emptyAction,
}: {
  requests: InventoryRequest[];
  detailBase?: string;
  emptyTitle?: string;
  empty?: string;
  emptyAction?: React.ReactNode;
}) {
  if (!requests.length)
    return (
      <Panel>
        <EmptyState title={emptyTitle} description={empty} action={emptyAction} />
      </Panel>
    );
  return (
    <Panel flush>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Nomor</TableHeader>
              <TableHeader>Keperluan</TableHeader>
              <TableHeader>Periode</TableHeader>
              <TableHeader>Kendaraan</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader />
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <strong>{request.number}</strong>
                  <small className={styles.block}>
                    {formatDate(request.submittedAt, "dd MMM yyyy")}
                  </small>
                </TableCell>
                <TableCell>{request.purpose}</TableCell>
                <TableCell>
                  {formatDate(request.startDate, "dd MMM")} -{" "}
                  {formatDate(request.endDate, "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  {request.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  unit
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                  <small className={styles.statusAction}>
                    {statusAction(request.status)}
                  </small>
                </TableCell>
                <TableCell>
                  <Link
                    className={`${styles.linkButton} ${styles.linkButtonSmall} ${styles.linkGhost}`}
                    href={`${detailBase}/${request.id}`}
                  >
                    Lihat detail
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="mobile-records">
        {requests.map((request) => (
          <MobileRecord
            key={request.id}
            eyebrow={request.number}
            title={request.purpose}
            status={
              <span>
                <StatusBadge status={request.status} />
                <small className={styles.statusAction}>
                  {statusAction(request.status)}
                </small>
              </span>
            }
            fields={[
              {
                label: "Periode",
                value: `${formatDate(request.startDate, "dd MMM")} - ${formatDate(request.endDate, "dd MMM yyyy")}`,
              },
              {
                label: "Kendaraan",
                value: `${request.items.reduce((sum, item) => sum + item.quantity, 0)} kendaraan`,
              },
            ]}
            actions={
              <Link
                className={`${styles.linkButton} ${styles.linkButtonSmall} ${styles.linkOutline}`}
                href={`${detailBase}/${request.id}`}
              >
                Lihat detail
              </Link>
            }
          />
        ))}
      </div>
    </Panel>
  );
}
