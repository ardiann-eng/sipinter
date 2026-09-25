import { inventoryItems, inventoryRequests, type InventoryRequest, type RequestStatus } from "@/lib/mock-data";

export const borrower = {
  name: "Ahmad",
  nip: "199003122019031008",
  email: "ahmad@makassarkota.go.id",
  phone: "0812 3456 7821",
  unit: "Bidang Aplikasi dan Informatika",
  skpd: "Dinas Komunikasi dan Informatika Kota Makassar",
  employeeId: "PEG-MKS-019031008",
};

const localRequests: InventoryRequest[] = [
  { id: "borrow-005", number: "SIPINTER/PMK/VII/2026/00116", registrationNumber: "SIPINTER/PMK/VII/2026/00116", requester: "Ahmad", borrowerName: "Ahmad", borrowerNip: borrower.nip, unit: borrower.unit, skpd: borrower.skpd, purpose: "Transportasi tim pelatihan pengelolaan konten portal perangkat daerah", location: "Ruang Command Center Diskominfo", itemCount: 1, items: [{ itemId: "item-003", itemName: "Bus Penumpang 25 Seat · DD 7013 RV", quantity: 1, conditionOnHandover: "GOOD" }], submittedAt: "2026-07-08T10:20:00+08:00", startDate: "2026-07-13", endDate: "2026-07-19", neededAt: "2026-07-13", status: "BORROWED", approver: "Sekretaris Daerah Kota Makassar" },
  { id: "borrow-006", number: "SIPINTER/PMK/VI/2026/00094", registrationNumber: "SIPINTER/PMK/VI/2026/00094", requester: "Ahmad", borrowerName: "Ahmad", borrowerNip: borrower.nip, unit: borrower.unit, skpd: borrower.skpd, purpose: "Transportasi forum konsultasi publik SPBE", location: "Hotel Claro Makassar", itemCount: 1, items: [{ itemId: "item-004", itemName: "HiAce 16 Seat · DD 7122 A", quantity: 1, conditionOnReturn: "GOOD" }], submittedAt: "2026-06-18T09:10:00+08:00", startDate: "2026-06-23", endDate: "2026-06-24", neededAt: "2026-06-23", status: "COMPLETED", approver: "Sekretaris Daerah Kota Makassar" },
  { id: "borrow-007", number: "SIPINTER/PMK/VII/2026/00110", registrationNumber: "SIPINTER/PMK/VII/2026/00110", requester: "Ahmad", borrowerName: "Ahmad", borrowerNip: borrower.nip, unit: borrower.unit, skpd: borrower.skpd, purpose: "Transportasi peserta bimbingan teknis keamanan informasi", location: "Aula Diskominfo Kota Makassar", itemCount: 1, items: [{ itemId: "item-005", itemName: "HiAce Premio · DD 7215 RF", quantity: 1 }], submittedAt: "2026-07-05T13:44:00+08:00", startDate: "2026-07-10", endDate: "2026-07-10", neededAt: "2026-07-10", status: "REVISION_REQUIRED", adminNote: "Surat tugas belum ditandatangani pimpinan. Unggah kembali dokumen yang telah disahkan." },
];

export const borrowerRequests = [
  ...inventoryRequests.filter((request) => request.borrowerNip === borrower.nip),
  ...localRequests,
];

export const availableItems = inventoryItems.filter((item) => item.status === "AVAILABLE" && item.availableStock > 0);

export const statusLabels: Record<RequestStatus, string> = {
  DRAFT: "Draf", WAITING_ADMIN_VERIFICATION: "Verifikasi admin", REVISION_REQUIRED: "Perlu revisi",
  WAITING_SEKDA_APPROVAL: "Menunggu persetujuan Sekda", APPROVED: "Disetujui", REJECTED: "Ditolak",
  READY_FOR_HANDOVER: "Siap diserahkan", BORROWED: "Sedang dipinjam", WAITING_RETURN: "Menunggu pengembalian",
  WAITING_RETURN_VERIFICATION: "Verifikasi pengembalian", RETURN_PROBLEM: "Kendala pengembalian",
  COMPLETED: "Selesai", CANCELLED: "Dibatalkan", OVERDUE: "Terlambat",
};

export function findBorrowerRequest(id: string) {
  return borrowerRequests.find((request) => request.id === id);
}
