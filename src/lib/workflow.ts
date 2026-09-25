import {
  ApprovalDecision,
  AuditAction,
  BorrowingStatus,
  CompletenessStatus,
  ItemStatus,
  NotificationType,
  ReturnSubmissionStatus,
  ReturnVerificationResult,
  Role,
  type Prisma,
  type ItemCondition,
  type ReturnIssueType,
} from "@prisma/client";
import { writeAudit } from "./audit";
import { assertRole, assertSameSKPD } from "./authorization";
import { db } from "./db";
import { AuthorizationError, WorkflowError, type RequestContext, type SessionUser } from "./types";
import { hasScheduleCapacity } from "./borrowing-policy";

type Transition = {
  from: BorrowingStatus;
  to: BorrowingStatus;
  roles: readonly Role[];
  noteRequired?: boolean;
};

export const borrowingTransitions: readonly Transition[] = [
  { from: BorrowingStatus.DRAFT, to: BorrowingStatus.WAITING_ADMIN_VERIFICATION, roles: [Role.BORROWER] },
  { from: BorrowingStatus.WAITING_ADMIN_VERIFICATION, to: BorrowingStatus.REVISION_REQUIRED, roles: [Role.ADMIN], noteRequired: true },
  { from: BorrowingStatus.WAITING_ADMIN_VERIFICATION, to: BorrowingStatus.WAITING_SEKDA_APPROVAL, roles: [Role.ADMIN] },
  { from: BorrowingStatus.WAITING_ADMIN_VERIFICATION, to: BorrowingStatus.REJECTED, roles: [Role.ADMIN], noteRequired: true },
  { from: BorrowingStatus.REVISION_REQUIRED, to: BorrowingStatus.WAITING_ADMIN_VERIFICATION, roles: [Role.BORROWER] },
  { from: BorrowingStatus.WAITING_SEKDA_APPROVAL, to: BorrowingStatus.APPROVED, roles: [Role.APPROVER] },
  { from: BorrowingStatus.WAITING_SEKDA_APPROVAL, to: BorrowingStatus.REJECTED, roles: [Role.APPROVER], noteRequired: true },
  { from: BorrowingStatus.APPROVED, to: BorrowingStatus.READY_FOR_HANDOVER, roles: [Role.ADMIN] },
  { from: BorrowingStatus.READY_FOR_HANDOVER, to: BorrowingStatus.BORROWED, roles: [Role.ADMIN] },
  { from: BorrowingStatus.BORROWED, to: BorrowingStatus.WAITING_RETURN, roles: [Role.BORROWER] },
  { from: BorrowingStatus.WAITING_RETURN, to: BorrowingStatus.WAITING_RETURN_VERIFICATION, roles: [Role.BORROWER] },
  { from: BorrowingStatus.WAITING_RETURN_VERIFICATION, to: BorrowingStatus.COMPLETED, roles: [Role.ADMIN] },
  { from: BorrowingStatus.WAITING_RETURN_VERIFICATION, to: BorrowingStatus.RETURN_PROBLEM, roles: [Role.ADMIN], noteRequired: true },
  { from: BorrowingStatus.RETURN_PROBLEM, to: BorrowingStatus.COMPLETED, roles: [Role.ADMIN], noteRequired: true },
] as const;

// Lifecycle overlays are intentionally outside primary workflow map.
export const lifecycleTransitions: readonly Transition[] = [
  { from: BorrowingStatus.DRAFT, to: BorrowingStatus.CANCELLED, roles: [Role.BORROWER] },
  { from: BorrowingStatus.BORROWED, to: BorrowingStatus.OVERDUE, roles: [Role.ADMIN] },
  { from: BorrowingStatus.OVERDUE, to: BorrowingStatus.WAITING_RETURN, roles: [Role.BORROWER] },
] as const;

export const reservationStatuses: readonly BorrowingStatus[] = [
  BorrowingStatus.WAITING_SEKDA_APPROVAL,
  BorrowingStatus.APPROVED,
  BorrowingStatus.READY_FOR_HANDOVER,
  BorrowingStatus.BORROWED,
  BorrowingStatus.WAITING_RETURN,
  BorrowingStatus.WAITING_RETURN_VERIFICATION,
  BorrowingStatus.RETURN_PROBLEM,
  BorrowingStatus.OVERDUE,
];

async function assertScheduleAvailability(
  tx: Prisma.TransactionClient,
  request: {
    id: string;
    borrowDate: Date;
    plannedReturnDate: Date;
    items: Array<{ itemId: string; quantity: number; item: { name: string; totalQuantity: number } }>;
  },
) {
  for (const entry of request.items) {
    const reserved = await tx.borrowingRequestItem.aggregate({
      where: {
        itemId: entry.itemId,
        borrowingRequestId: { not: request.id },
        borrowingRequest: {
          status: { in: [...reservationStatuses] },
          borrowDate: { lte: request.plannedReturnDate },
          plannedReturnDate: { gte: request.borrowDate },
        },
      },
      _sum: { quantity: true },
    });
    const reservedQuantity = reserved._sum.quantity ?? 0;
    if (!hasScheduleCapacity(entry.item.totalQuantity, entry.quantity, reservedQuantity)) {
      throw new WorkflowError(`${entry.item.name} sudah dialokasikan untuk jadwal yang bertumpang tindih`);
    }
  }
}

export function authorizeTransition(
  from: BorrowingStatus,
  to: BorrowingStatus,
  role: Role,
  note?: string,
): void {
  const transition = [...borrowingTransitions, ...lifecycleTransitions]
    .find((candidate) => candidate.from === from && candidate.to === to);
  if (!transition) throw new WorkflowError(`Transisi ${from} ke ${to} tidak valid`);
  assertRole({ role }, transition.roles);
  if (transition.noteRequired && !note?.trim()) throw new WorkflowError("Catatan wajib diisi untuk transisi ini");
}

type TransitionOptions = {
  note?: string;
  proofFile?: string;
  serviceableReturnConfirmed?: boolean;
  context?: RequestContext;
};

export function canRestoreStock(
  verification: {
    itemComplete: boolean;
    accessoriesComplete: boolean;
    physicallyIntact: boolean;
    functioningProperly: boolean;
    result: ReturnVerificationResult;
  },
  serviceableReturnConfirmed = false,
): boolean {
  return (
    verification.result === ReturnVerificationResult.ACCEPTED &&
    verification.itemComplete &&
    verification.accessoriesComplete &&
    verification.physicallyIntact &&
    verification.functioningProperly
  ) || serviceableReturnConfirmed;
}

export function shouldCreateApprovalRecord(from: BorrowingStatus, to: BorrowingStatus): boolean {
  return from === BorrowingStatus.WAITING_SEKDA_APPROVAL &&
    (to === BorrowingStatus.APPROVED || to === BorrowingStatus.REJECTED);
}

function assertOwner(actor: SessionUser, borrowerId: string): void {
  if (actor.role === Role.BORROWER && actor.id !== borrowerId) {
    throw new AuthorizationError("Peminjam hanya dapat mengubah permohonan sendiri");
  }
}

export async function transitionBorrowingRequest(
  requestId: string,
  to: BorrowingStatus,
  actor: SessionUser,
  options: TransitionOptions = {},
) {
  return db.$transaction(async (tx) => {
    const request = await tx.borrowingRequest.findUnique({
      where: { id: requestId },
      include: { items: { include: { item: true } }, returnVerification: true, borrower: true },
    });
    if (!request) throw new WorkflowError("Permohonan peminjaman tidak ditemukan");
    if (actor.role === Role.BORROWER) assertSameSKPD(actor, request.skpdId);
    authorizeTransition(request.status, to, actor.role, options.note);
    assertOwner(actor, request.borrowerId);

    if (to === BorrowingStatus.WAITING_ADMIN_VERIFICATION) {
      if (!request.items.length) throw new WorkflowError("Permohonan wajib memiliki minimal satu kendaraan");
      if (!request.ktpFile || !request.approvalLetterFile) {
        throw new WorkflowError("ktpFile dan approvalLetterFile wajib diunggah sebelum pengajuan");
      }
      if (request.borrowDate > request.plannedReturnDate) throw new WorkflowError("Rentang tanggal peminjaman tidak valid");
    }

    if (to === BorrowingStatus.WAITING_SEKDA_APPROVAL || to === BorrowingStatus.APPROVED) {
      await assertScheduleAvailability(tx, request);
    }

    if (shouldCreateApprovalRecord(request.status, to)) {
      await tx.approvalRecord.create({
        data: {
          borrowingRequestId: request.id,
          approverId: actor.id,
          decision: to === BorrowingStatus.APPROVED ? ApprovalDecision.APPROVED : ApprovalDecision.REJECTED,
          note: options.note?.trim(),
          decidedAt: new Date(),
        },
      });
    }

    if (to === BorrowingStatus.BORROWED) {
      for (const entry of request.items) {
        const changed = await tx.item.updateMany({
          where: { id: entry.itemId, status: ItemStatus.AVAILABLE, availableQuantity: { gte: entry.quantity } },
          data: { availableQuantity: { decrement: entry.quantity } },
        });
        if (changed.count !== 1) throw new WorkflowError(`Stok ${entry.item.name} tidak mencukupi`);
      }
      for (const entry of request.items) {
        await tx.item.updateMany({
          where: { id: entry.itemId, availableQuantity: 0 },
          data: { status: ItemStatus.OUT_OF_STOCK },
        });
      }
      await tx.handoverRecord.create({
        data: {
          borrowingRequestId: request.id,
          adminId: actor.id,
          recipientName: request.borrower.name,
          recipientIdentity: request.borrower.nip,
          handoverAt: new Date(),
          notes: options.note?.trim(),
          proofFile: options.proofFile,
        },
      });
    }

    if (to === BorrowingStatus.WAITING_RETURN_VERIFICATION) {
      const submission = await tx.returnSubmission.findFirst({
        where: { borrowingRequestId: request.id, status: ReturnSubmissionStatus.SUBMITTED },
        orderBy: { submittedAt: "desc" },
        include: { photos: true },
      });
      if (!submission || !submission.photos.length) throw new WorkflowError("Data dan foto pengembalian wajib disubmit");
    }

    if (to === BorrowingStatus.COMPLETED) {
      const resolvedProblem = request.status === BorrowingStatus.RETURN_PROBLEM;
      if (resolvedProblem && !options.serviceableReturnConfirmed) {
        throw new WorkflowError("serviceableReturnConfirmed wajib untuk menyelesaikan RETURN_PROBLEM");
      }
      if (!request.returnVerification || !canRestoreStock(request.returnVerification, resolvedProblem && options.serviceableReturnConfirmed)) {
        throw new WorkflowError("Kendaraan belum terbukti kembali lengkap, utuh, dan berfungsi");
      }
      for (const entry of request.items) {
        await tx.item.update({
          where: { id: entry.itemId },
          data: { availableQuantity: { increment: entry.quantity }, status: ItemStatus.AVAILABLE },
        });
      }
    }

    const now = new Date();
    const updated = await tx.borrowingRequest.update({
      where: { id: request.id },
      data: {
        status: to,
        adminNote: actor.role === Role.ADMIN && options.note ? options.note.trim() : request.adminNote,
        approverNote: actor.role === Role.APPROVER && options.note ? options.note.trim() : request.approverNote,
        submittedAt: to === BorrowingStatus.WAITING_ADMIN_VERIFICATION ? now : request.submittedAt,
        verifiedAt: to === BorrowingStatus.WAITING_SEKDA_APPROVAL ? now : request.verifiedAt,
        approvedAt: to === BorrowingStatus.APPROVED ? now : request.approvedAt,
        rejectedAt: to === BorrowingStatus.REJECTED ? now : request.rejectedAt,
        handedOverAt: to === BorrowingStatus.BORROWED ? now : request.handedOverAt,
        returnedAt: to === BorrowingStatus.WAITING_RETURN_VERIFICATION ? now : request.returnedAt,
        completedAt: to === BorrowingStatus.COMPLETED ? now : request.completedAt,
      },
    });
    await writeAudit(tx, actor, {
      action: to === BorrowingStatus.OVERDUE ? AuditAction.OVERDUE_MARKED : AuditAction.TRANSITION,
      module: "BORROWING",
      objectType: "BorrowingRequest",
      objectId: request.id,
      previousValue: { status: request.status },
      newValue: { status: to, note: options.note },
    }, options.context);
    return updated;
  });
}

export type ReturnPhotoInput = {
  fileUrl: string;
  photoType: string;
  description?: string;
  storageKey?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
};

export async function resubmitBorrowingRequest(
  requestId: string,
  actor: SessionUser,
  input: {
    purpose: string;
    activityLocation: string;
    borrowDate: Date;
    plannedReturnDate: Date;
    ktpFile: string;
    approvalLetterFile: string;
    items: Array<{ itemId: string; quantity: number; initialCondition: ItemCondition }>;
    context?: RequestContext;
  },
) {
  assertRole(actor, [Role.BORROWER]);
  return db.$transaction(async (tx) => {
    const request = await tx.borrowingRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new WorkflowError("Permohonan peminjaman tidak ditemukan");
    assertSameSKPD(actor, request.skpdId);
    assertOwner(actor, request.borrowerId);
    authorizeTransition(request.status, BorrowingStatus.WAITING_ADMIN_VERIFICATION, actor.role);
    const now = new Date();
    const updated = await tx.borrowingRequest.update({
      where: { id: request.id },
      data: {
        purpose: input.purpose,
        activityLocation: input.activityLocation,
        borrowDate: input.borrowDate,
        plannedReturnDate: input.plannedReturnDate,
        ktpFile: input.ktpFile,
        approvalLetterFile: input.approvalLetterFile,
        status: BorrowingStatus.WAITING_ADMIN_VERIFICATION,
        submittedAt: now,
        verifiedAt: null,
        adminNote: null,
        items: {
          deleteMany: {},
          create: input.items,
        },
      },
    });
    await writeAudit(tx, actor, {
      action: AuditAction.TRANSITION,
      module: "BORROWING",
      objectType: "BorrowingRequest",
      objectId: request.id,
      previousValue: { status: request.status, adminNote: request.adminNote },
      newValue: { status: BorrowingStatus.WAITING_ADMIN_VERIFICATION, resubmittedAt: now },
    }, input.context);
    return updated;
  });
}

export async function submitReturn(
  requestId: string,
  actor: SessionUser,
  input: {
    actualReturnDate: Date;
    submittedCondition: ItemCondition;
    completenessStatus: CompletenessStatus;
    notes?: string;
    photos: ReturnPhotoInput[];
    context?: RequestContext;
  },
) {
  if (input.photos.length < 2 || input.photos.length > 4) {
    throw new WorkflowError("Foto pengembalian wajib 2-4 foto");
  }
  return db.$transaction(async (tx) => {
    const request = await tx.borrowingRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new WorkflowError("Permohonan peminjaman tidak ditemukan");
    assertSameSKPD(actor, request.skpdId);
    assertOwner(actor, request.borrowerId);
    if (request.status !== BorrowingStatus.BORROWED && request.status !== BorrowingStatus.OVERDUE) {
      throw new WorkflowError(`Pengembalian tidak dapat dimulai dari ${request.status}`);
    }
    const borrowDay = new Date(request.borrowDate);
    borrowDay.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (input.actualReturnDate < borrowDay) {
      throw new WorkflowError("Tanggal pengembalian tidak boleh sebelum tanggal peminjaman");
    }
    if (input.actualReturnDate > endOfToday) {
      throw new WorkflowError("Tanggal pengembalian tidak boleh berada di masa depan");
    }
    authorizeTransition(request.status, BorrowingStatus.WAITING_RETURN, actor.role, input.notes);
    await tx.borrowingRequest.update({
      where: { id: request.id },
      data: { status: BorrowingStatus.WAITING_RETURN },
    });
    await writeAudit(tx, actor, {
      action: AuditAction.TRANSITION,
      module: "RETURN",
      objectType: "BorrowingRequest",
      objectId: request.id,
      previousValue: { status: request.status },
      newValue: { status: BorrowingStatus.WAITING_RETURN },
    }, input.context);
    authorizeTransition(BorrowingStatus.WAITING_RETURN, BorrowingStatus.WAITING_RETURN_VERIFICATION, actor.role, input.notes);
    const now = new Date();
    const submission = await tx.returnSubmission.create({
      data: {
        borrowingRequestId: request.id,
        submittedById: actor.id,
        actualReturnDate: input.actualReturnDate,
        submittedCondition: input.submittedCondition,
        completenessStatus: input.completenessStatus,
        notes: input.notes?.trim(),
        status: ReturnSubmissionStatus.SUBMITTED,
        submittedAt: now,
        photos: { create: input.photos },
      },
      include: { photos: true },
    });
    await tx.borrowingRequest.update({
      where: { id: request.id },
      data: { status: BorrowingStatus.WAITING_RETURN_VERIFICATION, returnedAt: input.actualReturnDate },
    });
    await writeAudit(tx, actor, {
      action: AuditAction.TRANSITION,
      module: "RETURN",
      objectType: "BorrowingRequest",
      objectId: request.id,
      previousValue: { status: BorrowingStatus.WAITING_RETURN },
      newValue: { status: BorrowingStatus.WAITING_RETURN_VERIFICATION, returnSubmissionId: submission.id },
    }, input.context);
    return submission;
  });
}

export async function verifyReturn(
  requestId: string,
  actor: SessionUser,
  input: {
    itemComplete: boolean;
    accessoriesComplete: boolean;
    physicallyIntact: boolean;
    functioningProperly: boolean;
    result: ReturnVerificationResult;
    issueType?: ReturnIssueType;
    issueDescription?: string;
    followUpRecommendation?: string;
    resolutionNote?: string;
    serviceableReturnConfirmed?: boolean;
    context?: RequestContext;
  },
) {
  assertRole(actor, [Role.ADMIN]);
  const resolvingProblem = input.serviceableReturnConfirmed === true;
  const to = input.result === ReturnVerificationResult.ACCEPTED
    ? BorrowingStatus.COMPLETED
    : BorrowingStatus.RETURN_PROBLEM;
  if (to === BorrowingStatus.RETURN_PROBLEM && (!input.issueType || !input.issueDescription?.trim())) {
    throw new WorkflowError("issueType dan issueDescription wajib untuk RETURN_PROBLEM");
  }
  if (
    input.result === ReturnVerificationResult.ACCEPTED &&
    (!input.itemComplete || !input.accessoriesComplete || !input.physicallyIntact || !input.functioningProperly)
  ) {
    throw new WorkflowError("Hasil ACCEPTED mensyaratkan kendaraan lengkap, utuh, dan berfungsi");
  }
  if (resolvingProblem && (!input.resolutionNote || input.resolutionNote.trim().length < 10)) {
    throw new WorkflowError("Catatan penyelesaian minimal 10 karakter");
  }
  return db.$transaction(async (tx) => {
    const request = await tx.borrowingRequest.findUnique({
      where: { id: requestId },
      include: { items: true, returnVerification: true },
    });
    if (!request) throw new WorkflowError("Permohonan peminjaman tidak ditemukan");
    if (request.status === BorrowingStatus.RETURN_PROBLEM && !resolvingProblem) {
      throw new WorkflowError("Konfirmasi kendaraan layak digunakan kembali wajib diberikan");
    }
    if (request.status !== BorrowingStatus.RETURN_PROBLEM && resolvingProblem) {
      throw new WorkflowError("Konfirmasi penyelesaian hanya berlaku untuk pengembalian bermasalah");
    }
    authorizeTransition(request.status, to, actor.role, resolvingProblem ? input.resolutionNote : input.issueDescription);
    const now = new Date();
    const verificationData = {
      itemComplete: input.itemComplete,
      accessoriesComplete: input.accessoriesComplete,
      physicallyIntact: input.physicallyIntact,
      functioningProperly: input.functioningProperly,
      result: input.result,
      issueType: input.issueType,
      issueDescription: input.issueDescription,
      followUpRecommendation: input.followUpRecommendation,
    };
    const verification = resolvingProblem && request.returnVerification
      ? await tx.returnVerification.update({
          where: { borrowingRequestId: request.id },
          data: {
            itemComplete: input.itemComplete,
            accessoriesComplete: input.accessoriesComplete,
            physicallyIntact: input.physicallyIntact,
            functioningProperly: input.functioningProperly,
            verifierId: actor.id,
            resolutionNote: input.resolutionNote?.trim(),
            resolvedAt: now,
            serviceableReturnConfirmed: true,
            verifiedAt: now,
          },
        })
      : await tx.returnVerification.upsert({
          where: { borrowingRequestId: request.id },
          update: { ...verificationData, verifierId: actor.id, verifiedAt: now },
          create: { ...verificationData, borrowingRequestId: request.id, verifierId: actor.id, verifiedAt: now },
        });
    if (to === BorrowingStatus.COMPLETED) {
      for (const entry of request.items) {
        await tx.item.update({
          where: { id: entry.itemId },
          data: { availableQuantity: { increment: entry.quantity }, status: ItemStatus.AVAILABLE },
        });
      }
    }
    await tx.returnSubmission.updateMany({
      where: { borrowingRequestId: request.id, status: { in: resolvingProblem ? [ReturnSubmissionStatus.SUBMITTED, ReturnSubmissionStatus.PROBLEM] : [ReturnSubmissionStatus.SUBMITTED] } },
      data: { status: to === BorrowingStatus.COMPLETED ? ReturnSubmissionStatus.VERIFIED : ReturnSubmissionStatus.PROBLEM, verifiedAt: now },
    });
    await tx.borrowingRequest.update({
      where: { id: request.id },
      data: { status: to, completedAt: to === BorrowingStatus.COMPLETED ? now : undefined, adminNote: resolvingProblem ? input.resolutionNote?.trim() : input.issueDescription },
    });
    await writeAudit(tx, actor, {
      action: AuditAction.TRANSITION,
      module: "RETURN",
      objectType: "BorrowingRequest",
      objectId: request.id,
      previousValue: { status: request.status },
      newValue: { status: to, returnVerificationId: verification.id, resolutionNote: input.resolutionNote },
    }, input.context);
    return verification;
  });
}

export async function markOverdueRequests(actor: SessionUser, now = new Date()): Promise<number> {
  assertRole(actor, [Role.ADMIN]);
  const requests = await db.borrowingRequest.findMany({
    where: { status: BorrowingStatus.BORROWED, plannedReturnDate: { lt: now } },
    select: { id: true, borrowerId: true, registrationNumber: true },
  });
  for (const request of requests) {
    await transitionBorrowingRequest(request.id, BorrowingStatus.OVERDUE, actor, {
      note: `Ditandai terlambat otomatis pada ${now.toISOString()}`,
    });
    await db.notification.create({ data: { userId: request.borrowerId, type: NotificationType.WARNING, title: "Pengembalian kendaraan terlambat", message: `${request.registrationNumber} telah melewati batas pengembalian. Segera ajukan pengembalian.`, link: `/peminjam/pengembalian/${request.id}` } });
  }
  return requests.length;
}
