import { notFound } from "next/navigation";
import { Camera } from "lucide-react";
import { BorrowingStatus, Role } from "@prisma/client";
import { AdminHeader, Panel, RequestIdentity, Status, s } from "@/components/admin/admin-ui";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toBorrowerRequest } from "@/lib/borrower-request";
import { ReturnVerificationActions } from "./return-verification-actions";

export default async function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [, { id }] = await Promise.all([requireRole([Role.ADMIN]), params]);
  const request = await db.borrowingRequest.findFirst({
    where: { id, status: { in: [BorrowingStatus.WAITING_RETURN_VERIFICATION, BorrowingStatus.RETURN_PROBLEM] } },
    include: {
      borrower: { include: { skpd: true } },
      items: { include: { item: true } },
      handoverRecord: true,
      returnVerification: true,
      returnSubmissions: { orderBy: { submittedAt: "desc" }, take: 1, include: { photos: true } },
    },
  });
  if (!request) notFound();
  const submission = request.returnSubmissions[0];
  if (!submission) notFound();
  const resolutionMode = request.status === BorrowingStatus.RETURN_PROBLEM;

  return <>
    <AdminHeader title={resolutionMode ? "Penyelesaian pengembalian bermasalah" : "Pemeriksaan pengembalian kendaraan"} description={request.registrationNumber} actions={<Status value={request.status} />} />
    <Panel title="Data peminjaman"><RequestIdentity request={toBorrowerRequest(request)} /></Panel>
    <div className={s.compare}>
      <Panel title="Saat diserahkan" description={request.handoverRecord ? `Diserahkan ${formatDateTime(request.handoverRecord.handoverAt)}` : "Data penyerahan belum tercatat"}><dl className="detail-grid">{request.items.map((entry) => <div className="detail-item" key={entry.id}><dt>{entry.item.name}</dt><dd>{entry.quantity} kendaraan · Kondisi awal: {entry.initialCondition}</dd></div>)}</dl></Panel>
      <Panel title="Bukti pengembalian" description={`Dikirim ${formatDateTime(submission.submittedAt ?? submission.createdAt)}`}><dl className="detail-grid"><div className="detail-item"><dt>Kondisi dilaporkan</dt><dd>{submission.submittedCondition}</dd></div><div className="detail-item"><dt>Kelengkapan</dt><dd>{submission.completenessStatus}</dd></div><div className="detail-item"><dt>Catatan peminjam</dt><dd>{submission.notes || "Tidak ada catatan"}</dd></div></dl><div className={s.photo} style={{ marginTop: 16 }}>{submission.photos.map((photo) => <a key={photo.id} href={`/api/uploads/${encodeURIComponent(photo.fileUrl)}`} target="_blank" rel="noreferrer"><Camera size={16} aria-hidden="true" /> {photo.originalName || "Buka foto bukti"}</a>)}</div></Panel>
    </div>
    <div className={s.grid7030}>
      <Panel title={resolutionMode ? "Pemeriksaan ulang kendaraan" : "Checklist kondisi kendaraan"} description={resolutionMode ? "Pastikan masalah telah ditangani dan kendaraan benar-benar layak digunakan kembali." : "Pastikan kondisi eksterior, interior, fungsi, dokumen, dan kunci kendaraan sebelum menetapkan hasil pemeriksaan."}><ReturnVerificationActions requestId={request.id} resolutionMode={resolutionMode} /></Panel>
      <Panel title={resolutionMode ? "Masalah yang dicatat" : "Catatan pemeriksaan"}>{resolutionMode ? <dl className="detail-grid"><div className="detail-item"><dt>Jenis masalah</dt><dd>{request.returnVerification?.issueType ?? "-"}</dd></div><div className="detail-item detail-item--wide"><dt>Deskripsi</dt><dd>{request.returnVerification?.issueDescription ?? "-"}</dd></div><div className="detail-item detail-item--wide"><dt>Rekomendasi</dt><dd>{request.returnVerification?.followUpRecommendation ?? "Belum ada rekomendasi"}</dd></div></dl> : <p>Hasil diterima akan menyelesaikan pengembalian dan mengembalikan status kendaraan menjadi tersedia. Hasil bermasalah memberi tahu peminjam untuk tindak lanjut.</p>}</Panel>
    </div>
  </>;
}
