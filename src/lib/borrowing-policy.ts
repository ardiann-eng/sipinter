import { WorkflowError } from "./types";

export type BorrowingPolicy = { standardDurationDays: number; minimumLeadDays: number };

function startOfUtcDay(value: Date) {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

export function validateBorrowingPolicy(
  borrowDate: Date,
  plannedReturnDate: Date,
  settings: BorrowingPolicy,
  now = new Date(),
) {
  const day = 86_400_000;
  const leadDays = Math.round((startOfUtcDay(borrowDate) - startOfUtcDay(now)) / day);
  const durationDays = Math.round((startOfUtcDay(plannedReturnDate) - startOfUtcDay(borrowDate)) / day) + 1;
  if (leadDays < settings.minimumLeadDays) {
    throw new WorkflowError(`Pengajuan wajib dibuat minimal ${settings.minimumLeadDays} hari sebelum tanggal penggunaan`);
  }
  if (durationDays > settings.standardDurationDays) {
    throw new WorkflowError(`Durasi peminjaman maksimal ${settings.standardDurationDays} hari kalender`);
  }
}

export function hasScheduleCapacity(totalQuantity: number, requestedQuantity: number, reservedQuantity: number) {
  return requestedQuantity > 0 && reservedQuantity + requestedQuantity <= totalQuantity;
}
