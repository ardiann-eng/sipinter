import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { AdminHeader } from "@/components/admin/admin-ui";
import { InventoryForm } from "@/components/admin/inventory-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toInventoryItem } from "@/lib/inventory-view";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const [, { id }] = await Promise.all([requireRole([Role.ADMIN]), params]);
  const record = await db.item.findUnique({ where: { id }, include: { category: true } });
  if (!record) notFound();
  const item = toInventoryItem(record);
  return <><AdminHeader title="Edit barang" description={`${item.name} · ${item.code} · perubahan dicatat dalam audit log.`} /><InventoryForm item={item} /></>;
}
