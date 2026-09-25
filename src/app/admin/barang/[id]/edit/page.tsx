import { notFound } from "next/navigation";
import { AdminHeader, InventoryForm } from "@/components/admin/admin-ui";
import { inventoryItems } from "@/lib/mock-data";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const item = inventoryItems.find((x) => x.id === id); if (!item) notFound(); return <><AdminHeader title="Edit kendaraan" description={`${item.name} · ${item.registrationNumber} · perubahan akan dicatat dalam audit log.`} /><InventoryForm item={item} /></>; }
