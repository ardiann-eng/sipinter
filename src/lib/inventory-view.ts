import type { Item, ItemCategory } from "@prisma/client";
import type { InventoryItem } from "./mock-data";

type InventoryRecord = Item & { category?: ItemCategory };

export function toInventoryItem(item: InventoryRecord): InventoryItem {
  return {
    id: item.id,
    code: item.itemCode,
    registrationNumber: item.registrationNumber ?? item.itemCode,
    name: item.name,
    category: item.category?.name ?? "Kendaraan Dinas",
    brand: item.name.toLowerCase().includes("hiace") ? "Toyota" : undefined,
    model: item.registrationNumber ?? undefined,
    unit: item.unit,
    totalStock: item.totalQuantity,
    availableStock: item.availableQuantity,
    location: item.location,
    acquisitionDate: `${item.procurementYear}-01-01`,
    condition: item.condition,
    status: item.status,
    imageUrl: item.mainPhoto ?? undefined,
    description: item.description ?? undefined,
    custodian: "Bagian Umum Sekretariat Daerah",
  };
}
