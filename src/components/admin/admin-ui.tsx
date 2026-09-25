import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  LockKeyhole,
  Pencil,
  Plus,
  Printer,
} from "lucide-react";
import {
  Badge,
  Button,
  DetailGrid,
  DetailItem,
  FilterBar,
  MobileRecord,
  PageHeader,
  Panel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  humanizeStatus,
  statusTone,
} from "@/components";
import type {
  InventoryItem,
  InventoryRequest,
  RequestStatus,
} from "@/lib/view-models";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import s from "./admin.module.css";

export { s };

export function AdminHeader(props: React.ComponentProps<typeof PageHeader>) {
  return <PageHeader eyebrow="Administrasi SIPINTER" {...props} />;
}

export function LinkButton({
  href,
  children,
  secondary,
  danger,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${s.linkButton} ${secondary ? s.linkButtonSecondary : ""} ${danger ? s.linkButtonDanger : ""}`}
    >
      {children}
    </Link>
  );
}

export function Status({
  value,
}: {
  value:
    | RequestStatus
    | InventoryItem["status"]
    | InventoryItem["condition"]
    | "ACTIVE"
    | "INACTIVE";
}) {
  const labels: Record<string, string> = {
    WAITING_ADMIN_VERIFICATION: "Menunggu verifikasi",
    WAITING_SEKDA_APPROVAL: "Menunggu Sekda",
    READY_FOR_HANDOVER: "Siap diserahkan",
    BORROWED: "Dipinjam",
    WAITING_RETURN_VERIFICATION: "Perlu diperiksa",
    RETURN_PROBLEM: "Bermasalah",
    COMPLETED: "Selesai",
    AVAILABLE: "Tersedia",
    OUT_OF_STOCK: "Stok habis",
    INACTIVE: "Nonaktif",
    ACTIVE: "Aktif",
    GOOD: "Baik",
    LIGHTLY_DAMAGED: "Rusak ringan",
    HEAVILY_DAMAGED: "Rusak berat",
  };
  return (
    <Badge dot tone={statusTone[value] ?? "neutral"}>
      {labels[value] ?? humanizeStatus(value)}
    </Badge>
  );
}

export function RequestTable({
  requests,
  kind = "verification",
}: {
  requests: InventoryRequest[];
  kind?: "verification" | "handover" | "return";
}) {
  const href = (id: string) =>
    kind === "verification"
      ? `/admin/verifikasi/${id}`
      : kind === "return"
        ? `/admin/pengembalian/${id}`
        : "/admin/penyerahan";
  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Nomor</TableHeader>
              <TableHeader>Pemohon / SKPD</TableHeader>
              <TableHeader>Keperluan</TableHeader>
              <TableHeader>Jadwal</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Aksi</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <strong className={s.mono}>{r.number}</strong>
                  <div className={s.compact}>{r.itemCount} jenis kendaraan</div>
                </TableCell>
                <TableCell>
                  <strong>{r.borrowerName}</strong>
                  <div className={s.compact}>{r.skpd}</div>
                </TableCell>
                <TableCell>
                  {r.purpose}
                  <div className={s.compact}>{r.location}</div>
                </TableCell>
                <TableCell>
                  {formatDate(r.startDate, "dd MMM")} -{" "}
                  {formatDate(r.endDate, "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <Status value={r.status} />
                </TableCell>
                <TableCell>
                  <Link className={s.link} href={href(r.id)}>
                    Periksa <ChevronRight size={14} />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="mobile-records">
        {requests.map((r) => (
          <MobileRecord
            key={r.id}
            eyebrow={r.number}
            title={r.borrowerName}
            status={<Status value={r.status} />}
            fields={[
              { label: "SKPD", value: r.skpd },
              {
                label: "Jadwal",
                value: `${formatDate(r.startDate, "dd MMM")} - ${formatDate(r.endDate, "dd MMM")}`,
              },
              { label: "Keperluan", value: r.purpose },
              { label: "Kendaraan", value: `${r.itemCount} jenis` },
            ]}
            actions={
              <LinkButton href={href(r.id)} secondary>
                Periksa detail
              </LinkButton>
            }
          />
        ))}
      </div>
    </>
  );
}

export function ItemTable({ items }: { items: InventoryItem[] }) {
  return (
    <>
      <TableContainer>
        <Table className={s.stickyTable}>
          <TableHead>
            <TableRow>
              <TableHeader>Kode / Registrasi</TableHeader>
              <TableHeader>Kendaraan</TableHeader>
              <TableHeader>Stok</TableHeader>
              <TableHeader>Kondisi</TableHeader>
              <TableHeader>Lokasi</TableHeader>
              <TableHeader>Aksi</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <strong className={s.mono}>{item.code}</strong>
                  <div className={s.compact}>{item.registrationNumber}</div>
                </TableCell>
                <TableCell>
                  <div className={s.vehicleCell}>
                    {item.imageUrl && (
                      <Image className={s.vehicleThumb} src={item.imageUrl} alt="" width={72} height={48} />
                    )}
                    <div>
                      <strong>{item.name}</strong>
                      <div className={s.compact}>
                        {item.registrationNumber} · {item.model ?? item.brand}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <strong>{item.availableStock}</strong> / {item.totalStock}{" "}
                  {item.unit}
                  <div>
                    <Status value={item.status} />
                  </div>
                </TableCell>
                <TableCell>
                  <Status value={item.condition} />
                </TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <div className={s.actions}>
                    <Link
                      title="Lihat"
                      aria-label={`Lihat detail ${item.name} ${item.registrationNumber}`}
                      href={`/admin/barang/${item.id}`}
                      className={s.link}
                    >
                      <Eye size={17} />
                    </Link>
                    <Link
                      title="Edit"
                      aria-label={`Edit ${item.name} ${item.registrationNumber}`}
                      href={`/admin/barang/${item.id}/edit`}
                      className={s.link}
                    >
                      <Pencil size={17} />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="mobile-records">
        {items.map((item) => (
          <MobileRecord
            key={item.id}
            eyebrow={item.code}
            title={item.name}
            status={<Status value={item.status} />}
            fields={[
              { label: "Kategori", value: item.category },
              {
                label: "Stok",
                value: `${item.availableStock}/${item.totalStock} ${item.unit}`,
              },
              { label: "Kondisi", value: <Status value={item.condition} /> },
              { label: "Lokasi", value: item.location },
            ]}
            actions={
              <>
                <LinkButton href={`/admin/barang/${item.id}`} secondary>
                  Lihat
                </LinkButton>
                <LinkButton href={`/admin/barang/${item.id}/edit`} secondary>
                  Edit
                </LinkButton>
              </>
            }
          />
        ))}
      </div>
    </>
  );
}

export function RequestIdentity({ request }: { request: InventoryRequest }) {
  return (
    <DetailGrid>
      <DetailItem label="Nomor permohonan">
        <span className={s.mono}>{request.number}</span>
      </DetailItem>
      <DetailItem label="Diajukan">
        {formatDateTime(request.submittedAt)} WITA
      </DetailItem>
      <DetailItem label="Pemohon">
        {request.borrowerName}
        <br />
        <span className={s.compact}>
          NIP {request.borrowerNip ?? "Belum tercatat"}
        </span>
      </DetailItem>
      <DetailItem label="Perangkat daerah">
        {request.skpd}
        <br />
        <span className={s.compact}>{request.unit}</span>
      </DetailItem>
      <DetailItem label="Waktu penggunaan">
        {formatDate(request.startDate)} sampai {formatDate(request.endDate)}
      </DetailItem>
      <DetailItem label="Lokasi kegiatan">{request.location}</DetailItem>
      <DetailItem wide label="Keperluan">
        {request.purpose}
      </DetailItem>
    </DetailGrid>
  );
}

export function FormalReportPreview() {
  return (
    <div className={s.preview}>
      <header className={s.previewHeader}>
        <div className={s.seal}>
          LAMBANG
          <br />
          KOTA
        </div>
        <div>
          <strong>PEMERINTAH KOTA MAKASSAR</strong>
          <br />
          <strong>SEKRETARIAT DAERAH</strong>
          <div className={s.compact}>
            Jalan Jenderal Ahmad Yani Nomor 2, Makassar 90111
          </div>
        </div>
      </header>
      <h2>Laporan Penggunaan Kendaraan Dinas</h2>
      <p className={s.compact} style={{ textAlign: "center" }}>
        Periode 1 - 31 Juli 2026 · Nomor: 028/417/BAG.UMUM/VII/2026
      </p>
      <p>
        Pada periode pelaporan tercatat <strong>31 transaksi peminjaman</strong>{" "}
        oleh 6 perangkat daerah. Sebanyak 27 transaksi selesai tepat waktu, 2
        masih aktif, dan 2 melewati batas pengembalian.
      </p>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Uraian</TableHeader>
              <TableHeader>Jumlah</TableHeader>
              <TableHeader>Persentase</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Permohonan diterima</TableCell>
              <TableCell>31</TableCell>
              <TableCell>100%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Selesai tepat waktu</TableCell>
              <TableCell>27</TableCell>
              <TableCell>87,1%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Masih dipinjam</TableCell>
              <TableCell>2</TableCell>
              <TableCell>6,45%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Terlambat</TableCell>
              <TableCell>2</TableCell>
              <TableCell>6,45%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className={s.signature}>
          <div />
          <div>
            Makassar, 31 Juli 2026
            <br />
            Kepala Bagian Umum
            <br />
            <br />
            <br />
            <strong>Drs. H. Muhammad Ansar, M.Si.</strong>
            <br />
            NIP 19691215 199003 1 008
          </div>
        </div>
      </TableContainer>
    </div>
  );
}

export const adminIcons = {
  CheckCircle2,
  Download,
  LockKeyhole,
  Plus,
  Printer,
};
export {
  Badge,
  Button,
  DetailGrid,
  DetailItem,
  FilterBar,
  Panel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  formatCurrency,
  formatDate,
  formatDateTime,
};
