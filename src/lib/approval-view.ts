import "server-only";

import { BorrowingStatus, type Prisma } from "@prisma/client";
import { formatDate, formatDateTime } from "./format";

type ApprovalRequest = Prisma.BorrowingRequestGetPayload<{
  include: { borrower: { include: { skpd: true } }; items: { include: { item: true } }; approvalRecords: true };
}>;

export function toApprovalView(request: ApprovalRequest) {
  const decision = [...request.approvalRecords].sort(
    (left, right) => right.decidedAt.getTime() - left.decidedAt.getTime(),
  )[0];
  const status = request.status === BorrowingStatus.WAITING_SEKDA_APPROVAL ? "MENUNGGU" : request.status === BorrowingStatus.REJECTED ? "DITOLAK" : "DISETUJUI";
  return {
    id: request.id,
    number: request.registrationNumber,
    requester: request.borrower.name,
    nip: request.borrower.nip,
    unit: request.borrower.position,
    skpd: request.borrower.skpd.name,
    purpose: request.purpose,
    location: request.activityLocation,
    submittedAt: formatDateTime(request.submittedAt ?? request.createdAt),
    verifiedAt: request.verifiedAt ? formatDateTime(request.verifiedAt) : "Waktu tidak tercatat",
    startDate: formatDate(request.borrowDate),
    endDate: formatDate(request.plannedReturnDate),
    duration: `${Math.max(1, Math.ceil((request.plannedReturnDate.getTime() - request.borrowDate.getTime()) / 86_400_000) + 1)} hari`,
    items: request.items.map((entry) => ({
      name: entry.item.name,
      code: entry.item.registrationNumber ?? entry.item.itemCode,
      quantity: entry.quantity,
      unit: entry.item.unit,
    })),
    admin: "Administrator SIPINTER",
    adminNote: request.adminNote ?? "Tidak ada catatan verifikasi administrator.",
    status,
    decidedAt: decision ? formatDateTime(decision.decidedAt) : undefined,
    decisionNote: decision?.note ?? request.approverNote ?? undefined,
  } as const;
}
