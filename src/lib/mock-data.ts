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
  { id: "item-001", code: "KDR-BUS-7106A", registrationNumber: "DD 7106 A", name: "Bus Penumpang 25 Seat", category: "Kendaraan Dinas", model: "Medium Bus · DD 7106 A", unit: "kendaraan", totalStock: 1, availableStock: 1, location: "Pool Kendaraan Balaikota", acquisitionDate: "2022-02-12", condition: "GOOD", status: "AVAILABLE", imageUrl: "/kendaraan/bus-25-seat-dd-7106-a.jpg", description: "Bus dinas berkapasitas maksimal 25 penumpang. Cocok untuk perjalanan rombongan dan kegiatan kedinasan.", custodian: "Bagian Umum Sekretariat Daerah" },
  { id: "item-002", code: "KDR-BUS-7003AD", registrationNumber: "DD 7003 AD", name: "Bus Penumpang 30 Seat", category: "Kendaraan Dinas", brand: "Isuzu", model: "Bus 30 Seat · DD 7003 AD", unit: "kendaraan", totalStock: 1, availableStock: 1, location: "Pool Kendaraan Balaikota", acquisitionDate: "2021-08-19", condition: "GOOD", status: "AVAILABLE", imageUrl: "/kendaraan/bus-30-seat-dd-7003-ad.jpg", description: "Bus dinas berkapasitas maksimal 30 penumpang untuk perjalanan rombongan berukuran besar.", custodian: "Bagian Umum Sekretariat Daerah" },
  { id: "item-003", code: "KDR-BUS-7013RV", registrationNumber: "DD 7013 RV", name: "Bus Penumpang 25 Seat", category: "Kendaraan Dinas", brand: "Isuzu", model: "Medium Bus · DD 7013 RV", unit: "kendaraan", totalStock: 1, availableStock: 1, location: "Pool Kendaraan Balaikota", acquisitionDate: "2023-11-03", condition: "GOOD", status: "AVAILABLE", imageUrl: "/kendaraan/bus-25-seat-dd-7013-rv.jpg", description: "Bus dinas berkapasitas maksimal 25 penumpang. Unit dibedakan dengan nomor polisi DD 7013 RV.", custodian: "Bagian Umum Sekretariat Daerah" },
  { id: "item-004", code: "KDR-HAC-7122A", registrationNumber: "DD 7122 A", name: "HiAce 16 Seat", category: "Kendaraan Dinas", brand: "Toyota", model: "HiAce Commuter · DD 7122 A", unit: "kendaraan", totalStock: 1, availableStock: 1, location: "Pool Kendaraan Balaikota", acquisitionDate: "2024-05-15", condition: "GOOD", status: "AVAILABLE", imageUrl: "/kendaraan/hiace-16-seat-dd-7122-a.jpg", description: "Toyota HiAce berkapasitas maksimal 16 penumpang untuk mobilitas tim kedinasan.", custodian: "Bagian Umum Sekretariat Daerah" },
  { id: "item-005", code: "KDR-HAP-7215RF", registrationNumber: "DD 7215 RF", name: "HiAce Premio", category: "Kendaraan Dinas", brand: "Toyota", model: "HiAce Premio · DD 7215 RF", unit: "kendaraan", totalStock: 1, availableStock: 1, location: "Pool Kendaraan Balaikota", acquisitionDate: "2022-01-27", condition: "GOOD", status: "AVAILABLE", imageUrl: "/kendaraan/hiace-premio-dd-7215-rf.jpg", description: "Toyota HiAce Premio untuk perjalanan dinas dengan kabin penumpang yang lebih lega.", custodian: "Bagian Umum Sekretariat Daerah" },
  { id: "item-006", code: "KDR-HAC-7001TF", registrationNumber: "DD 7001 TF", name: "HiAce 12 Seat", category: "Kendaraan Dinas", brand: "Toyota", model: "HiAce · DD 7001 TF", unit: "kendaraan", totalStock: 1, availableStock: 1, location: "Pool Kendaraan Balaikota", acquisitionDate: "2023-01-08", condition: "GOOD", status: "AVAILABLE", imageUrl: "/kendaraan/hiace-12-seat-dd-7001-tf.jpg", description: "Toyota HiAce berkapasitas maksimal 12 penumpang untuk perjalanan dinas kelompok kecil.", custodian: "Bagian Umum Sekretariat Daerah" },
];

export const inventoryRequests: InventoryRequest[] = [
  { id: "borrow-001", number: "SIPINTER/PMK/VII/2026/00128", registrationNumber: "SIPINTER/PMK/VII/2026/00128", requester: "Ahmad", borrowerName: "Ahmad", borrowerNip: "199003122019031008", unit: "Bidang Aplikasi dan Informatika", skpd: "Dinas Komunikasi dan Informatika Kota Makassar", purpose: "Transportasi tim sosialisasi layanan digital Pemerintah Kota Makassar", location: "Kantor Kecamatan Panakkukang", itemCount: 2, items: [{ itemId: "item-001", itemName: "Bus Penumpang 25 Seat · DD 7106 A", quantity: 1 }, { itemId: "item-004", itemName: "HiAce 16 Seat · DD 7122 A", quantity: 1 }], submittedAt: "2026-07-17T09:12:00+08:00", startDate: "2026-07-21", endDate: "2026-07-21", neededAt: "2026-07-21", status: "WAITING_ADMIN_VERIFICATION" },
  { id: "borrow-002", number: "SIPINTER/PMK/VII/2026/00127", registrationNumber: "SIPINTER/PMK/VII/2026/00127", requester: "Nurul Fadilah", borrowerName: "Nurul Fadilah", borrowerNip: "198806142015032004", unit: "Bagian Protokol", skpd: "Sekretariat Daerah Kota Makassar", purpose: "Transportasi peserta rapat koordinasi perangkat daerah", location: "Ruang Sipakatau Balaikota", itemCount: 1, items: [{ itemId: "item-002", itemName: "Bus Penumpang 30 Seat · DD 7003 AD", quantity: 1 }], submittedAt: "2026-07-16T14:35:00+08:00", startDate: "2026-07-22", endDate: "2026-07-22", neededAt: "2026-07-22", status: "WAITING_SEKDA_APPROVAL", approver: "Sekretaris Daerah Kota Makassar" },
  { id: "borrow-003", number: "SIPINTER/PMK/VII/2026/00124", registrationNumber: "SIPINTER/PMK/VII/2026/00124", requester: "Muhammad Ilham", borrowerName: "Muhammad Ilham", unit: "Sekretariat", skpd: "Dinas Pendidikan Kota Makassar", purpose: "Transportasi tim monitoring sekolah dasar", location: "Kecamatan Biringkanaya", itemCount: 1, items: [{ itemId: "item-005", itemName: "HiAce Premio · DD 7215 RF", quantity: 1, conditionOnHandover: "GOOD" }], submittedAt: "2026-07-14T08:20:00+08:00", startDate: "2026-07-15", endDate: "2026-07-17", neededAt: "2026-07-15", status: "BORROWED", approver: "Sekretaris Daerah Kota Makassar" },
  { id: "borrow-004", number: "SIPINTER/PMK/VII/2026/00119", registrationNumber: "SIPINTER/PMK/VII/2026/00119", requester: "Andi Rahmatia", borrowerName: "Andi Rahmatia", unit: "Bidang Pencegahan dan Pengendalian Penyakit", skpd: "Dinas Kesehatan Kota Makassar", purpose: "Transportasi kegiatan pelayanan kesehatan keliling", location: "Kelurahan Untia", itemCount: 1, items: [{ itemId: "item-006", itemName: "HiAce 12 Seat · DD 7001 TF", quantity: 1, conditionOnReturn: "GOOD" }], submittedAt: "2026-07-09T10:05:00+08:00", startDate: "2026-07-11", endDate: "2026-07-12", neededAt: "2026-07-11", status: "COMPLETED", approver: "Sekretaris Daerah Kota Makassar" },
];

export const users: MockUser[] = [
  { id: "user-001", employeeId: "198205122006041004", nip: "198205122006041004", name: "Syarifuddin", email: "syarifuddin@makassarkota.go.id", unit: "Bagian Umum", skpd: "Sekretariat Daerah Kota Makassar", role: "ADMIN", active: true, status: "ACTIVE", lastActive: "2026-07-18T08:42:00+08:00" },
  { id: "user-002", employeeId: "199003122019031008", nip: "199003122019031008", name: "Ahmad", email: "ahmad@makassarkota.go.id", unit: "Bidang Aplikasi dan Informatika", skpd: "Dinas Komunikasi dan Informatika Kota Makassar", role: "BORROWER", active: true, status: "ACTIVE", lastActive: "2026-07-18T08:31:00+08:00" },
  { id: "user-003", employeeId: "197604091998031002", nip: "197604091998031002", name: "Sekretaris Daerah Kota Makassar", email: "sekda@makassarkota.go.id", unit: "Sekretaris Daerah", skpd: "Sekretariat Daerah Kota Makassar", role: "APPROVER", active: true, status: "ACTIVE", lastActive: "2026-07-17T16:02:00+08:00" },
  { id: "user-005", employeeId: "198811022010011011", nip: "198811022010011011", name: "Muhammad Ilham", email: "ilham@makassarkota.go.id", unit: "Sekretariat", skpd: "Dinas Pendidikan Kota Makassar", role: "BORROWER", active: false, status: "INACTIVE", lastActive: "2026-06-28T11:17:00+08:00" },
];

export const auditEntries: AuditEntry[] = [
  { id: "audit-001", actor: "Syarifuddin", actorRole: "ADMIN", action: "Memverifikasi pengajuan kendaraan", entity: "BORROWING_REQUEST", subject: "SIPINTER/PMK/VII/2026/00128", detail: "Dokumen dan kebutuhan kendaraan Ahmad dinyatakan lengkap untuk diteruskan kepada Sekda.", occurredAt: "2026-07-18T08:14:00+08:00", ipAddress: "10.10.4.27" },
  { id: "audit-002", actor: "Sekretaris Daerah Kota Makassar", actorRole: "APPROVER", action: "Menyetujui peminjaman kendaraan", entity: "BORROWING_REQUEST", subject: "SIPINTER/PMK/VII/2026/00127", detail: "Permohonan Bus Penumpang 30 Seat untuk rapat koordinasi disetujui.", occurredAt: "2026-07-17T15:48:00+08:00", ipAddress: "10.10.2.11" },
  { id: "audit-003", actor: "Syarifuddin", actorRole: "ADMIN", action: "Menambahkan kendaraan", entity: "ITEM", subject: "KDR-BUS-7106A", detail: "Bus Penumpang 25 Seat DD 7106 A ditambahkan ke katalog kendaraan.", occurredAt: "2026-07-17T10:22:00+08:00", ipAddress: "10.10.4.18" },
  { id: "audit-004", actor: "Syarifuddin", actorRole: "ADMIN", action: "Mengakses laporan", entity: "BORROWING_REQUEST", subject: "Laporan peminjaman kendaraan Juli 2026", detail: "Administrator membuka laporan rekapitulasi peminjaman kendaraan dinas.", occurredAt: "2026-07-16T13:06:00+08:00", ipAddress: "10.10.4.18" },
];

export const dashboardSummary = {
  totalItems: 6,
  availableItems: 6,
  activeBorrowings: 3,
  maintenanceItems: 0,
  pendingRequests: 7,
  pendingApprovals: 4,
  overdueReturns: 2,
  assetValue: 4_875_650_000,
  lastUpdated: "2026-07-18T08:45:00+08:00",
};
