import { notFound } from "next/navigation";
import Image from "next/image";
import { History, Pencil, QrCode } from "lucide-react";
import { Role } from "@prisma/client";
import { AdminHeader, DetailGrid, DetailItem, LinkButton, Panel, Status, formatDateTime, s } from "@/components/admin/admin-ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toInventoryItem } from "@/lib/inventory-view";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [, { id }] = await Promise.all([requireRole([Role.ADMIN]), params]);
  const record = await db.item.findUnique({ where: { id }, include: { category: true, requestItems: { include: { borrowingRequest: { include: { borrower: true } } }, orderBy: { borrowingRequest: { updatedAt: "desc" } }, take: 5 } } });
  if (!record) notFound();
  const item = toInventoryItem(record);
  return <>
    <AdminHeader title={item.name} description={`${item.code} · ${item.category}`} actions={<LinkButton href={`/admin/barang/${item.id}/edit`}><Pencil size={16} aria-hidden="true" /> Edit barang</LinkButton>} />
    <div className={s.grid7030}><div className={s.stack}><Panel title="Identitas barang" action={<Status value={item.status} />}>{item.imageUrl && <div className={s.vehicleHero}><Image src={item.imageUrl} alt={item.name} fill sizes="(max-width: 900px) 100vw, 720px" priority /></div>}<DetailGrid><DetailItem label="Kategori">{item.category}</DetailItem><DetailItem label="Identitas">{record.registrationNumber ?? item.code}</DetailItem><DetailItem label="Tahun pengadaan">{record.procurementYear}</DetailItem><DetailItem label="Penanggung jawab">{item.custodian}</DetailItem><DetailItem label="Lokasi">{item.location}</DetailItem><DetailItem wide label="Deskripsi">{item.description || "Inventaris operasional Pemerintah Kota Makassar."}</DetailItem></DetailGrid></Panel><Panel title="Riwayat penggunaan terakhir">{record.requestItems.length ? <ul className={s.activity}>{record.requestItems.map((entry) => <li key={entry.id}><p><strong>{entry.borrowingRequest.registrationNumber}</strong> · {entry.borrowingRequest.borrower.name}<br />{entry.borrowingRequest.purpose}</p><time>{formatDateTime(entry.borrowingRequest.updatedAt)} WITA</time></li>)}</ul> : <p className={s.empty}>Belum ada riwayat penggunaan barang ini.</p>}</Panel></div><aside className={s.stack}><Panel title="Ketersediaan terkini"><div className={s.summaryItem}><span>Tersedia</span><strong>{item.availableStock} / {item.totalStock}</strong><small>{item.unit} · kondisi <Status value={item.condition} /></small></div></Panel><Panel title="Label barang"><div className={s.photo}><div><QrCode size={82} aria-hidden="true" /><br /><span className={s.mono}>{item.code}</span></div></div><div className={s.actions} style={{ marginTop: 12 }}><LinkButton href="/admin/audit" secondary><History size={15} aria-hidden="true" /> Audit</LinkButton></div></Panel></aside></div>
  </>;
}
