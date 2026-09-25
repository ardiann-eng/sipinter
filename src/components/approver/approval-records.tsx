import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Badge, EmptyState, MobileRecord, Panel, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components";
import type { ApprovalRecord } from "./data";

function statusBadge(status: ApprovalRecord["status"]) {
  if (status === "DISETUJUI") return <Badge tone="success" dot>Disetujui</Badge>;
  if (status === "DITOLAK") return <Badge tone="danger" dot>Ditolak</Badge>;
  return <Badge tone="maroon" dot>Menunggu keputusan</Badge>;
}

export function ApprovalRecords({ records, history = false }: { records: ApprovalRecord[]; history?: boolean }) {
  return <Panel flush title={history ? "Catatan keputusan" : "Antrean permohonan"} description={history ? "Keputusan persetujuan yang telah dicatat dalam sistem" : "Urutan berdasarkan waktu verifikasi administrator"}>
    {!records.length && <EmptyState title={history ? "Belum ada riwayat keputusan" : "Tidak ada permohonan menunggu"} description={history ? "Keputusan yang sudah dicatat akan tampil di sini." : "Seluruh permohonan yang masuk sudah ditangani."} />}
    {!!records.length && <>
    <TableContainer><Table className="approval-table"><TableHead><TableRow>
      <TableHeader>No. permohonan</TableHeader><TableHeader>Pemohon / perangkat daerah</TableHeader><TableHeader>Keperluan</TableHeader><TableHeader>Periode</TableHeader><TableHeader>Kendaraan</TableHeader><TableHeader>{history ? "Keputusan" : "Diverifikasi"}</TableHeader><TableHeader>Aksi</TableHeader>
    </TableRow></TableHead><TableBody>{records.map((record) => <TableRow key={record.id}>
      <TableCell><strong className="record-number">{record.number}</strong><small className="record-muted">Diajukan {record.submittedAt}</small></TableCell>
      <TableCell><strong>{record.requester}</strong><small className="record-muted">{record.skpd}</small></TableCell>
      <TableCell><span className="purpose-cell">{record.purpose}</span></TableCell>
      <TableCell><strong>{record.startDate.split(",")[0]}</strong><small className="record-muted">{record.duration}</small></TableCell>
      <TableCell><strong>{record.items.reduce((sum, item) => sum + item.quantity, 0)} kendaraan</strong><small className="record-muted">{record.items.length} jenis kendaraan</small></TableCell>
      <TableCell>{history ? <>{statusBadge(record.status)}<small className="record-muted">{record.decidedAt}</small></> : <><span className="verified-time"><Clock3 size={14} />{record.verifiedAt}</span><small className="record-muted">oleh {record.admin}</small></>}</TableCell>
      <TableCell><Link className={history ? "button button--ghost button--sm" : "button button--secondary button--sm"} href={`/sekda/menunggu/${record.id}`}>{history ? "Lihat" : "Tinjau"}<ArrowRight size={14} /></Link></TableCell>
    </TableRow>)}</TableBody></Table></TableContainer>
    <div className="mobile-records">{records.map((record) => <MobileRecord key={record.id} eyebrow={record.number} title={record.requester} status={statusBadge(record.status)} fields={[
      { label: "Perangkat daerah", value: record.skpd }, { label: "Keperluan", value: record.purpose }, { label: "Periode", value: `${record.startDate.split(",")[0]} (${record.duration})` }, { label: "Kendaraan", value: `${record.items.reduce((sum, item) => sum + item.quantity, 0)} kendaraan, ${record.items.length} jenis` },
    ]} actions={<Link href={`/sekda/menunggu/${record.id}`} className="record-action-link">{history ? "Lihat rincian" : "Tinjau permohonan"}<ArrowRight size={15} /></Link>} />)}</div>
    </>}
  </Panel>;
}
