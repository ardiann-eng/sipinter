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
} from "@/lib/mock-data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import s from "./admin.module.css";

export { s };

export const adminUser = {
  name: "Syarifuddin",
  email: "syarifuddin@makassarkota.go.id",
  role: "ADMIN" as const,
  unit: "Bagian Umum Sekretariat Daerah",
};
export const adminAccess = {
  requiredRole: "ADMIN" as const,
  enforcement: "middleware" as const,
};

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
                      href={`/admin/barang/${item.id}`}
                      className={s.link}
                    >
                      <Eye size={17} />
                    </Link>
                    <Link
                      title="Edit"
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

export function InventoryForm({ item }: { item?: InventoryItem }) {
  return (
    <form className={s.stack}>
      <Panel
        title="Identitas kendaraan"
        description="Kolom bertanda bintang wajib diisi."
      >
        <div className={s.formGrid}>
          <label className="field">
            <span className="field__label">Nama kendaraan *</span>
            <input
              className="input"
              defaultValue={item?.name}
              placeholder="Contoh: Bus Penumpang 25 Seat"
            />
          </label>
          <label className="field">
            <span className="field__label">Kategori *</span>
            <select
              className="select"
              defaultValue={item?.category ?? "Kendaraan Dinas"}
            >
              <option>Kendaraan Dinas</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Kode kendaraan *</span>
            <input
              className="input"
              defaultValue={item?.code}
              placeholder="KDR-BUS-00001"
            />
          </label>
          <label className="field">
            <span className="field__label">Nomor registrasi *</span>
            <input
              className="input"
              defaultValue={item?.registrationNumber}
              placeholder="DD 0000 XX"
            />
          </label>
          <label className="field">
            <span className="field__label">Merek</span>
            <input className="input" defaultValue={item?.brand} />
          </label>
          <label className="field">
            <span className="field__label">Model / tipe</span>
            <input className="input" defaultValue={item?.model} />
          </label>
        </div>
      </Panel>
      <Panel title="Ketersediaan dan penempatan">
        <div className={s.formGrid}>
          <label className="field">
            <span className="field__label">Jumlah kendaraan *</span>
            <input
              className="input"
              type="number"
              min="1"
              defaultValue={item?.totalStock ?? 1}
            />
          </label>
          <label className="field">
            <span className="field__label">Satuan *</span>
            <input className="input" defaultValue={item?.unit ?? "kendaraan"} />
          </label>
          <label className="field">
            <span className="field__label">Kondisi awal *</span>
            <select className="select" defaultValue={item?.condition ?? "GOOD"}>
              <option value="GOOD">Baik</option>
              <option value="LIGHTLY_DAMAGED">Rusak ringan</option>
              <option value="HEAVILY_DAMAGED">Rusak berat</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Lokasi penyimpanan *</span>
            <input
              className="input"
              defaultValue={item?.location ?? "Pool Kendaraan Balaikota"}
            />
          </label>
          <label className="field">
            <span className="field__label">Tanggal perolehan</span>
            <input
              className="input"
              type="date"
              defaultValue={item?.acquisitionDate}
            />
          </label>
          <label className="field">
            <span className="field__label">Nilai perolehan (Rp)</span>
            <input
              className="input"
              type="number"
              defaultValue={item?.acquisitionValue}
            />
          </label>
          <label className={`field ${s.full}`}>
            <span className="field__label">Deskripsi</span>
            <textarea className={s.textarea} defaultValue={item?.description} />
          </label>
        </div>
      </Panel>
      <div className={s.stickyActions}>
        <LinkButton href="/admin/barang" secondary>
          Batal
        </LinkButton>
        <Button type="submit">Simpan data kendaraan</Button>
      </div>
    </form>
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
