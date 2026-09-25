import { Download, Plus } from "lucide-react";
import { AdminHeader, Button, FilterBar, ItemTable, LinkButton, Panel, Select } from "@/components/admin/admin-ui";
import { inventoryItems } from "@/lib/mock-data";

export default function ItemsPage() {
  return <><AdminHeader title="Master data kendaraan" description="Kelola identitas, kapasitas penumpang, kondisi, dan lokasi enam kendaraan dinas." actions={<><Button variant="outline"><Download size={16} /> Ekspor CSV</Button><LinkButton href="/admin/barang/tambah"><Plus size={16} /> Tambah kendaraan</LinkButton></>} /><FilterBar searchPlaceholder="Cari kode, nomor polisi, atau nama kendaraan"><Select aria-label="Jenis kendaraan"><option>Semua kendaraan</option><option>Bus Penumpang</option><option>Toyota HiAce</option></Select><Select aria-label="Kondisi"><option>Semua kondisi</option><option>Baik</option><option>Rusak ringan</option><option>Rusak berat</option></Select><Select aria-label="Status"><option>Semua status</option><option>Tersedia</option><option>Sedang dipinjam</option><option>Nonaktif</option></Select><Button variant="outline">Atur ulang</Button></FilterBar><Panel title="Daftar kendaraan" description="6 kendaraan dinas · kapasitas 12 sampai 30 penumpang" flush><ItemTable items={inventoryItems} /></Panel></>;
}
