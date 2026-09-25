import Link from "next/link";
import { ItemCondition, ItemStatus, Role } from "@prisma/client";
import { Plus } from "lucide-react";
import { AdminHeader, ItemTable, Panel, s } from "@/components/admin/admin-ui";
import { InventoryExportButton } from "@/components/admin/inventory-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toInventoryItem } from "@/lib/inventory-view";

export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ q?: string; condition?: string; status?: string }> }) {
  const [, params] = await Promise.all([requireRole([Role.ADMIN]), searchParams]);
  const condition = Object.values(ItemCondition).includes(params.condition as ItemCondition) ? params.condition as ItemCondition : undefined;
  const status = Object.values(ItemStatus).includes(params.status as ItemStatus) ? params.status as ItemStatus : undefined;
  const q = params.q?.trim();
  const records = await db.item.findMany({
    where: {
      ...(condition ? { condition } : {}),
      ...(status ? { status } : {}),
      ...(q ? { OR: [{ itemCode: { contains: q } }, { registrationNumber: { contains: q } }, { name: { contains: q } }] } : {}),
    },
    include: { category: true },
    orderBy: [{ status: "asc" }, { name: "asc" }, { itemCode: "asc" }],
  });
  const items = records.map(toInventoryItem);
  return <>
    <AdminHeader title="Master data inventaris" description="Kelola kendaraan, ruangan, dan perlengkapan kegiatan dinas." actions={<><InventoryExportButton items={items} /><Link className={s.linkButton} href="/admin/barang/tambah"><Plus size={16} aria-hidden="true" /> Tambah barang</Link></>} />
    <form className="filter-bar" method="get"><div className="filter-bar__search"><input name="q" defaultValue={q} aria-label="Cari barang" placeholder="Cari kode, identitas, atau nama barang" /></div><select className="select" name="condition" defaultValue={condition ?? ""} aria-label="Kondisi"><option value="">Semua kondisi</option><option value="GOOD">Baik</option><option value="LIGHTLY_DAMAGED">Rusak ringan</option><option value="HEAVILY_DAMAGED">Rusak berat</option><option value="LOST">Hilang</option></select><select className="select" name="status" defaultValue={status ?? ""} aria-label="Status"><option value="">Semua status</option><option value="AVAILABLE">Tersedia</option><option value="OUT_OF_STOCK">Sedang dipinjam</option><option value="INACTIVE">Nonaktif</option></select><button className="button button--outline" type="submit">Terapkan</button><Link className={s.link} href="/admin/barang">Atur ulang</Link></form>
    <Panel title="Daftar inventaris" description={`${items.length} barang dan fasilitas ditemukan`} flush><ItemTable items={items} /></Panel>
  </>;
}
