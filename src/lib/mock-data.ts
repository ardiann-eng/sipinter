import type { UserRole } from "./navigation";

export type ItemCondition = "GOOD" | "LIGHTLY_DAMAGED" | "HEAVILY_DAMAGED" | "LOST";
export type ItemStatus = "AVAILABLE" | "OUT_OF_STOCK" | "INACTIVE";
export type RequestStatus =
  | "DRAFT"
  | "WAITING_ADMIN_VERIFICATION"
  | "REVISION_REQUIRED"
  | "WAITING_SEKDA_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "READY_FOR_HANDOVER"
  | "BORROWED"
  | "WAITING_RETURN"
  | "WAITING_RETURN_VERIFICATION"
  | "RETURN_PROBLEM"
  | "COMPLETED"
  | "CANCELLED"
  | "OVERDUE";

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
  condition: ItemCondition;
  status: ItemStatus;
  imageUrl?: string;
  description?: string;
  custodian?: string;
}

export interface RequestItem {
  itemId: string;
  itemName: string;
  quantity: number;
  conditionOnHandover?: ItemCondition;
  conditionOnReturn?: ItemCondition;
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
  items: RequestItem[];
  submittedAt: string;
  startDate: string;
  endDate: string;
  neededAt: string;
  status: RequestStatus;
  approver?: string;
  adminNote?: string;
  approverNote?: string;
}

export interface MockUser {
  id: string;
  employeeId: string;
  nip: string;
  name: string;
  email: string;
  phone?: string;
  unit: string;
  skpd: string;
  role: UserRole;
  active: boolean;
  status: "ACTIVE" | "INACTIVE";
  lastActive: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  entity: "BORROWING_REQUEST" | "ITEM" | "USER" | "RETURN";
  subject: string;
  detail: string;
  occurredAt: string;
  ipAddress: string;
}

export const skpdNames = [
  "Sekretariat Daerah Kota Makassar",
  "Dinas Komunikasi dan Informatika Kota Makassar",
  "Dinas Pendidikan Kota Makassar",
  "Dinas Kesehatan Kota Makassar",
  "Badan Perencanaan Pembangunan Daerah Kota Makassar",
  "Badan Keuangan dan Aset Daerah Kota Makassar",
] as const;

export const inventoryItems: InventoryItem[] = [
  { id: "item-001", code: "ELK-LPT-00128", registrationNumber: "SIPINTER/PMK/VII/2026/00128", name: "Laptop Lenovo ThinkPad E14", category: "Perangkat Komputer", brand: "Lenovo", model: "ThinkPad E14 Gen 5", unit: "unit", totalStock: 12, availableStock: 7, location: "Gudang Fasilitas Balai Kota", acquisitionDate: "2025-02-12", acquisitionValue: 14850000, condition: "GOOD", status: "AVAILABLE", description: "Laptop operasional untuk kegiatan kedinasan dan rapat lapangan." },
  { id: "item-002", code: "ELK-PRO-00047", registrationNumber: "SIPINTER/PMK/VII/2026/00047", name: "Proyektor Epson EB-E01", category: "Peralatan Presentasi", brand: "Epson", model: "EB-E01", unit: "unit", totalStock: 8, availableStock: 4, location: "Gudang Fasilitas Balai Kota", acquisitionDate: "2024-08-19", acquisitionValue: 6840000, condition: "GOOD", status: "AVAILABLE", description: "Proyektor untuk rapat, sosialisasi, dan kegiatan perangkat daerah." },
  { id: "item-003", code: "MEU-KRS-00082", registrationNumber: "SIPINTER/PMK/VII/2026/00082", name: "Kursi Lipat Chitose", category: "Meubelair", brand: "Chitose", model: "Yamato HAA", unit: "buah", totalStock: 100, availableStock: 65, location: "Gudang Perlengkapan Balaikota", acquisitionDate: "2023-11-03", acquisitionValue: 485000, condition: "GOOD", status: "AVAILABLE" },
  { id: "item-004", code: "AUD-SPK-00031", registrationNumber: "SIPINTER/PMK/VII/2026/00031", name: "Portable Sound System", category: "Peralatan Audio", brand: "TOA", model: "ZWS-240DC", unit: "set", totalStock: 5, availableStock: 0, location: "Gudang Fasilitas Balai Kota", acquisitionDate: "2024-05-15", acquisitionValue: 12750000, condition: "GOOD", status: "OUT_OF_STOCK" },
  { id: "item-005", code: "TRN-MBL-00009", registrationNumber: "SIPINTER/PMK/VII/2026/00009", name: "Toyota HiAce Premio", category: "Kendaraan Dinas", brand: "Toyota", model: "HiAce Premio", unit: "unit", totalStock: 2, availableStock: 1, location: "Pool Kendaraan Balaikota", acquisitionDate: "2022-01-27", acquisitionValue: 545000000, condition: "LIGHTLY_DAMAGED", status: "AVAILABLE", custodian: "Bagian Umum Sekretariat Daerah" },
  { id: "item-006", code: "TND-RPT-00056", registrationNumber: "SIPINTER/PMK/VII/2026/00056", name: "Tenda Kerucut 3 x 3 Meter", category: "Perlengkapan Kegiatan", unit: "unit", totalStock: 20, availableStock: 0, location: "Gudang Perlengkapan Balaikota", acquisitionDate: "2023-01-08", acquisitionValue: 3750000, condition: "HEAVILY_DAMAGED", status: "INACTIVE" },
];

export const inventoryRequests: InventoryRequest[] = [
  { id: "borrow-001", number: "SIPINTER/PMK/VII/2026/00128", registrationNumber: "SIPINTER/PMK/VII/2026/00128", requester: "Ahmad", borrowerName: "Ahmad", borrowerNip: "199003122019031008", unit: "Bidang Aplikasi dan Informatika", skpd: "Dinas Komunikasi dan Informatika Kota Makassar", purpose: "Sosialisasi layanan digital Pemerintah Kota Makassar", location: "Kantor Kecamatan Panakkukang", itemCount: 2, items: [{ itemId: "item-001", itemName: "Laptop Lenovo ThinkPad E14", quantity: 1 }, { itemId: "item-002", itemName: "Proyektor Epson EB-E01", quantity: 1 }], submittedAt: "2026-07-17T09:12:00+08:00", startDate: "2026-07-21", endDate: "2026-07-21", neededAt: "2026-07-21", status: "WAITING_ADMIN_VERIFICATION" },
  { id: "borrow-002", number: "SIPINTER/PMK/VII/2026/00127", registrationNumber: "SIPINTER/PMK/VII/2026/00127", requester: "Nurul Fadilah", borrowerName: "Nurul Fadilah", borrowerNip: "198806142015032004", unit: "Bagian Protokol", skpd: "Sekretariat Daerah Kota Makassar", purpose: "Rapat koordinasi perangkat daerah", location: "Ruang Sipakatau Balaikota", itemCount: 4, items: [{ itemId: "item-003", itemName: "Kursi Lipat Chitose", quantity: 30 }, { itemId: "item-004", itemName: "Portable Sound System", quantity: 1 }], submittedAt: "2026-07-16T14:35:00+08:00", startDate: "2026-07-22", endDate: "2026-07-22", neededAt: "2026-07-22", status: "WAITING_SEKDA_APPROVAL", approver: "Sekretaris Daerah Kota Makassar" },
  { id: "borrow-003", number: "SIPINTER/PMK/VII/2026/00124", registrationNumber: "SIPINTER/PMK/VII/2026/00124", requester: "Muhammad Ilham", borrowerName: "Muhammad Ilham", unit: "Sekretariat", skpd: "Dinas Pendidikan Kota Makassar", purpose: "Monitoring sekolah dasar", location: "Kecamatan Biringkanaya", itemCount: 1, items: [{ itemId: "item-005", itemName: "Toyota HiAce Premio", quantity: 1 }], submittedAt: "2026-07-14T08:20:00+08:00", startDate: "2026-07-15", endDate: "2026-07-17", neededAt: "2026-07-15", status: "BORROWED", approver: "Sekretaris Daerah Kota Makassar" },
  { id: "borrow-004", number: "SIPINTER/PMK/VII/2026/00119", registrationNumber: "SIPINTER/PMK/VII/2026/00119", requester: "Andi Rahmatia", borrowerName: "Andi Rahmatia", unit: "Bidang Pencegahan dan Pengendalian Penyakit", skpd: "Dinas Kesehatan Kota Makassar", purpose: "Kegiatan pelayanan kesehatan keliling", location: "Kelurahan Untia", itemCount: 2, items: [{ itemId: "item-002", itemName: "Proyektor Epson EB-E01", quantity: 1 }], submittedAt: "2026-07-09T10:05:00+08:00", startDate: "2026-07-11", endDate: "2026-07-12", neededAt: "2026-07-11", status: "COMPLETED", approver: "Sekretaris Daerah Kota Makassar" },
];

export const users: MockUser[] = [
  { id: "user-001", employeeId: "198205122006041004", nip: "198205122006041004", name: "Syarifuddin", email: "syarifuddin@makassarkota.go.id", unit: "Bagian Umum", skpd: "Sekretariat Daerah Kota Makassar", role: "ADMIN", active: true, status: "ACTIVE", lastActive: "2026-07-18T08:42:00+08:00" },
  { id: "user-002", employeeId: "199003122019031008", nip: "199003122019031008", name: "Ahmad", email: "ahmad@makassarkota.go.id", unit: "Bidang Aplikasi dan Informatika", skpd: "Dinas Komunikasi dan Informatika Kota Makassar", role: "BORROWER", active: true, status: "ACTIVE", lastActive: "2026-07-18T08:31:00+08:00" },
  { id: "user-003", employeeId: "197604091998031002", nip: "197604091998031002", name: "Sekretaris Daerah Kota Makassar", email: "sekda@makassarkota.go.id", unit: "Sekretaris Daerah", skpd: "Sekretariat Daerah Kota Makassar", role: "APPROVER", active: true, status: "ACTIVE", lastActive: "2026-07-17T16:02:00+08:00" },
  { id: "user-005", employeeId: "198811022010011011", nip: "198811022010011011", name: "Muhammad Ilham", email: "ilham@makassarkota.go.id", unit: "Sekretariat", skpd: "Dinas Pendidikan Kota Makassar", role: "BORROWER", active: false, status: "INACTIVE", lastActive: "2026-06-28T11:17:00+08:00" },
];

export const auditEntries: AuditEntry[] = [
  { id: "audit-001", actor: "Syarifuddin", actorRole: "ADMIN", action: "Memverifikasi pengajuan", entity: "BORROWING_REQUEST", subject: "SIPINTER/PMK/VII/2026/00128", detail: "Dokumen pengajuan Ahmad dinyatakan lengkap dan diteruskan untuk persetujuan.", occurredAt: "2026-07-18T08:14:00+08:00", ipAddress: "10.10.4.27" },
  { id: "audit-002", actor: "Sekretaris Daerah Kota Makassar", actorRole: "APPROVER", action: "Menyetujui peminjaman", entity: "BORROWING_REQUEST", subject: "SIPINTER/PMK/VII/2026/00127", detail: "Permohonan fasilitas rapat koordinasi perangkat daerah disetujui.", occurredAt: "2026-07-17T15:48:00+08:00", ipAddress: "10.10.2.11" },
  { id: "audit-003", actor: "Syarifuddin", actorRole: "ADMIN", action: "Menambahkan barang", entity: "ITEM", subject: "SIPINTER/PMK/VII/2026/00128", detail: "Laptop Lenovo ThinkPad E14 ditambahkan ke katalog fasilitas.", occurredAt: "2026-07-17T10:22:00+08:00", ipAddress: "10.10.4.18" },
  { id: "audit-004", actor: "Syarifuddin", actorRole: "ADMIN", action: "Mengakses laporan", entity: "BORROWING_REQUEST", subject: "Laporan peminjaman Juli 2026", detail: "Administrator membuka laporan rekapitulasi peminjaman fasilitas.", occurredAt: "2026-07-16T13:06:00+08:00", ipAddress: "10.10.4.18" },
];

export const dashboardSummary = {
  totalItems: 147,
  availableItems: 98,
  activeBorrowings: 23,
  maintenanceItems: 6,
  pendingRequests: 7,
  pendingApprovals: 4,
  overdueReturns: 2,
  assetValue: 4_875_650_000,
  lastUpdated: "2026-07-18T08:45:00+08:00",
};
