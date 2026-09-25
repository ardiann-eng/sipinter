export type ItemConditionView = "GOOD" | "LIGHTLY_DAMAGED" | "HEAVILY_DAMAGED" | "LOST";
export type ItemStatusView = "AVAILABLE" | "OUT_OF_STOCK" | "INACTIVE";
export type RequestStatus = "DRAFT" | "WAITING_ADMIN_VERIFICATION" | "REVISION_REQUIRED" | "WAITING_SEKDA_APPROVAL" | "APPROVED" | "REJECTED" | "READY_FOR_HANDOVER" | "BORROWED" | "WAITING_RETURN" | "WAITING_RETURN_VERIFICATION" | "RETURN_PROBLEM" | "COMPLETED" | "CANCELLED" | "OVERDUE";

export interface InventoryItem {
  id: string;
  code: string;
  registrationNumber: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  unit: string;
  totalStock: number;
  availableStock: number;
  location: string;
  acquisitionDate?: string;
  acquisitionValue?: number;
  condition: ItemConditionView;
  status: ItemStatusView;
  imageUrl?: string;
  description?: string;
  custodian?: string;
}

export interface InventoryRequest {
  id: string;
  number: string;
  registrationNumber: string;
  requester: string;
  borrowerName: string;
  borrowerNip?: string;
  unit: string;
  skpd: string;
  purpose: string;
  location?: string;
  itemCount: number;
  items: Array<{ itemId: string; itemName: string; quantity: number; conditionOnHandover?: ItemConditionView; conditionOnReturn?: ItemConditionView }>;
  submittedAt: string;
  startDate: string;
  endDate: string;
  neededAt: string;
  status: RequestStatus;
  approver?: string;
  adminNote?: string;
  approverNote?: string;
}

export type ApprovalStatus = "MENUNGGU" | "DISETUJUI" | "DITOLAK";
export interface ApprovalRecord {
  id: string;
  number: string;
  requester: string;
  nip: string;
  unit: string;
  skpd: string;
  purpose: string;
  location: string;
  submittedAt: string;
  verifiedAt: string;
  startDate: string;
  endDate: string;
  duration: string;
  items: Array<{ name: string; code: string; quantity: number; unit: string }>;
  admin: string;
  adminNote: string;
  status: ApprovalStatus;
  decidedAt?: string;
  decisionNote?: string;
}

export const requestStatusLabels: Record<RequestStatus, string> = {
  DRAFT: "Draf", WAITING_ADMIN_VERIFICATION: "Verifikasi admin", REVISION_REQUIRED: "Perlu revisi",
  WAITING_SEKDA_APPROVAL: "Menunggu persetujuan Sekda", APPROVED: "Disetujui", REJECTED: "Ditolak",
  READY_FOR_HANDOVER: "Siap diserahkan", BORROWED: "Sedang dipinjam", WAITING_RETURN: "Menunggu pengembalian",
  WAITING_RETURN_VERIFICATION: "Verifikasi pengembalian", RETURN_PROBLEM: "Kendala pengembalian",
  COMPLETED: "Selesai", CANCELLED: "Dibatalkan", OVERDUE: "Terlambat",
};
