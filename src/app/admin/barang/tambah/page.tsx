import { Role } from "@prisma/client";
import { AdminHeader } from "@/components/admin/admin-ui";
import { InventoryForm } from "@/components/admin/inventory-form";
import { requireRole } from "@/lib/auth";

export default async function AddItemPage() {
  await requireRole([Role.ADMIN]);
  return <><AdminHeader title="Tambah kendaraan" description="Daftarkan kendaraan dinas baru beserta nomor polisi, kapasitas, dan kondisi awal." /><InventoryForm /></>;
}
