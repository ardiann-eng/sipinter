import { Download, Plus } from "lucide-react";
import { AdminHeader, Button, FilterBar, ItemTable, LinkButton, Panel, Select } from "@/components/admin/admin-ui";
import { inventoryItems } from "@/lib/mock-data";

export default function ItemsPage() {
  return <><AdminHeader title="Master data barang" description="Kelola identitas, stok, kondisi, dan penempatan seluruh fasilitas." actions={<><Button variant="outline"><Download size={16} /> Ekspor CSV</Button><LinkButton href="/admin/barang/tambah"><Plus size={16} /> Tambah barang</LinkButton></>} /><FilterBar searchPlaceholder="Cari kode, registrasi, atau nama barang"><Select aria-label="Kategori"><option>Semua kategori</option><option>Perangkat Komputer</option><option>Peralatan Presentasi</option><option>Kendaraan Dinas</option></Select><Select aria-label="Kondisi"><option>Semua kondisi</option><option>Baik</option><option>Rusak ringan</option><option>Rusak berat</option></Select><Select aria-label="Status"><option>Semua status</option><option>Tersedia</option><option>Stok habis</option><option>Nonaktif</option></Select><Button variant="outline">Atur ulang</Button></FilterBar><Panel title="Daftar inventaris" description="147 unit dalam 6 kategori · 6 rekaman contoh" flush><ItemTable items={inventoryItems} /></Panel></>;
}
