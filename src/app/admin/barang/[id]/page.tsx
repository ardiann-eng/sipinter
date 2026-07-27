import { notFound } from "next/navigation";
import { History, Pencil, QrCode } from "lucide-react";
import {
  AdminHeader,
  Button,
  DetailGrid,
  DetailItem,
  LinkButton,
  Panel,
  Status,
  formatCurrency,
  formatDate,
  s,
} from "@/components/admin/admin-ui";
import { inventoryItems } from "@/lib/mock-data";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = inventoryItems.find((x) => x.id === id);
  if (!item) notFound();
  return (
    <>
      <AdminHeader
        title={item.name}
        description={`${item.code} · ${item.registrationNumber}`}
        actions={
          <LinkButton href={`/admin/barang/${item.id}/edit`}>
            <Pencil size={16} /> Edit barang
          </LinkButton>
        }
      />
      <div className={s.grid7030}>
        <div className={s.stack}>
          <Panel title="Identitas aset" action={<Status value={item.status} />}>
            <DetailGrid>
              <DetailItem label="Kategori">{item.category}</DetailItem>
              <DetailItem label="Merek / model">
                {item.brand ?? "-"} · {item.model ?? "-"}
              </DetailItem>
              <DetailItem label="Tanggal perolehan">
                {item.acquisitionDate
                  ? formatDate(item.acquisitionDate)
                  : "Tidak tercatat"}
              </DetailItem>
              <DetailItem label="Nilai perolehan">
                {item.acquisitionValue
                  ? formatCurrency(item.acquisitionValue)
                  : "Tidak tercatat"}
              </DetailItem>
              <DetailItem label="Penanggung jawab">
                {item.custodian ?? "Bagian Umum Sekretariat Daerah"}
              </DetailItem>
              <DetailItem label="Lokasi">{item.location}</DetailItem>
              <DetailItem wide label="Deskripsi">
                {item.description ??
                  "Fasilitas operasional Pemerintah Kota Makassar."}
              </DetailItem>
            </DetailGrid>
          </Panel>
          <Panel title="Riwayat mutasi dan kondisi">
            <ul className={s.activity}>
              <li>
                <p>
                  <strong>Stok dikembalikan</strong> dari kegiatan pelayanan
                  keliling. Kondisi baik.
                </p>
                <time>13 Juli 2026, 15.32 WITA</time>
              </li>
              <li>
                <p>
                  <strong>Dipinjamkan</strong> kepada Dinas Kesehatan Kota
                  Makassar.
                </p>
                <time>11 Juli 2026, 07.48 WITA</time>
              </li>
              <li>
                <p>
                  <strong>Pemeriksaan berkala</strong> oleh pengurus barang.
                  Tidak ada temuan.
                </p>
                <time>2 Juli 2026, 10.15 WITA</time>
              </li>
            </ul>
          </Panel>
        </div>
        <aside className={s.stack}>
          <Panel title="Stok terkini">
            <div className={s.summaryItem}>
              <span>Tersedia</span>
              <strong>
                {item.availableStock} / {item.totalStock}
              </strong>
              <small>
                {item.unit} · kondisi <Status value={item.condition} />
              </small>
            </div>
          </Panel>
          <Panel title="Label inventaris">
            <div className={s.photo}>
              <div>
                <QrCode size={82} />
                <br />
                <span className={s.mono}>{item.code}</span>
              </div>
            </div>
            <div className={s.actions} style={{ marginTop: 12 }}>
              <Button variant="outline" disabled title="Pencetakan label belum terhubung">
                Cetak label
              </Button>
              <LinkButton href="/admin/audit" secondary>
                <History size={15} /> Audit
              </LinkButton>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
