import Link from "next/link";
import { BorrowingStatus, Role } from "@prisma/client";
import { AdminHeader, Panel, Status, s } from "@/components/admin/admin-ui";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ReturnPage() {
  await requireRole([Role.ADMIN]);
  const requests = await db.borrowingRequest.findMany({
    where: { status: { in: [BorrowingStatus.WAITING_RETURN_VERIFICATION, BorrowingStatus.RETURN_PROBLEM] } },
    include: { borrower: { include: { skpd: true } }, items: true }, orderBy: { updatedAt: "asc" },
  });
  const waiting = requests.filter((request) => request.status === BorrowingStatus.WAITING_RETURN_VERIFICATION).length;
  const problems = requests.filter((request) => request.status === BorrowingStatus.RETURN_PROBLEM).length;
  return <><AdminHeader title="Verifikasi pengembalian kendaraan" description="Bandingkan kondisi awal dan akhir kendaraan, catat kelengkapan, serta tindak lanjuti masalah pengembalian." /><section className={s.summaryStrip}><div className={s.summaryItem}><span>Menunggu pemeriksaan</span><strong>{waiting}</strong><small>Perlu tindakan admin</small></div><div className={s.summaryItem}><span>Bermasalah</span><strong>{problems}</strong><small>Menunggu tindak lanjut</small></div></section><Panel title="Antrean pemeriksaan" flush>{requests.length ? <TableContainer><Table><TableHead><TableRow><TableHeader>Nomor</TableHeader><TableHeader>Peminjam</TableHeader><TableHeader>Keperluan</TableHeader><TableHeader>Jadwal</TableHeader><TableHeader>Status</TableHeader><TableHeader>Aksi</TableHeader></TableRow></TableHead><TableBody>{requests.map((request) => <TableRow key={request.id}><TableCell><strong className={s.mono}>{request.registrationNumber}</strong><div className={s.compact}>{request.items.length} kendaraan</div></TableCell><TableCell><strong>{request.borrower.name}</strong><div className={s.compact}>{request.borrower.skpd.name}</div></TableCell><TableCell>{request.purpose}</TableCell><TableCell>{formatDate(request.borrowDate, "dd MMM")} - {formatDate(request.plannedReturnDate, "dd MMM yyyy")}</TableCell><TableCell><Status value={request.status} /></TableCell><TableCell><Link className={s.link} href={`/admin/pengembalian/${request.id}`}>Periksa</Link></TableCell></TableRow>)}</TableBody></Table></TableContainer> : <p className={s.empty}>Tidak ada pengembalian kendaraan yang perlu diperiksa.</p>}</Panel></>;
}
