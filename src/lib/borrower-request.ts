import type { BorrowingStatus, ItemCondition } from "@prisma/client";
import type { InventoryRequest, RequestStatus } from "@/lib/mock-data";

type BorrowingRequestRecord = {
  id: string;
  registrationNumber: string;
  purpose: string;
  activityLocation: string;
  borrowDate: Date;
  plannedReturnDate: Date;
  status: BorrowingStatus;
  submittedAt: Date | null;
  createdAt: Date;
  adminNote: string | null;
  approverNote: string | null;
  borrower: { name: string; nip: string; position: string; skpd: { name: string } };
  items: Array<{ quantity: number; initialCondition: ItemCondition; item: { id: string; name: string } }>;
};

export function toBorrowerRequest(request: BorrowingRequestRecord): InventoryRequest {
  return {
    id: request.id,
    number: request.registrationNumber,
    registrationNumber: request.registrationNumber,
    requester: request.borrower.name,
    borrowerName: request.borrower.name,
    borrowerNip: request.borrower.nip,
    unit: request.borrower.position,
    skpd: request.borrower.skpd.name,
    purpose: request.purpose,
    location: request.activityLocation,
    itemCount: request.items.length,
    items: request.items.map((entry) => ({ itemId: entry.item.id, itemName: entry.item.name, quantity: entry.quantity, conditionOnHandover: entry.initialCondition })),
    submittedAt: (request.submittedAt ?? request.createdAt).toISOString(),
    startDate: request.borrowDate.toISOString(),
    endDate: request.plannedReturnDate.toISOString(),
    neededAt: request.borrowDate.toISOString(),
    status: request.status as RequestStatus,
    adminNote: request.adminNote ?? undefined,
    approverNote: request.approverNote ?? undefined,
  };
}
