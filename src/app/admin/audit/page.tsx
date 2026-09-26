import { Role } from "@prisma/client";
import { LockKeyhole } from "lucide-react";
import { AdminHeader, Badge, Panel, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, formatDateTime, s } from "@/components/admin/admin-ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Select } from "@/components";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ q?: string; module?: string }> }) {
  const [, params] = await Promise.all([requireRole([Role.ADMIN]), searchParams]);
  const q = params.q?.trim();
  const moduleFilter = params.module?.trim();
  const entries = await db.auditLog.findMany({
    where: {
      ...(moduleFilter ? { module: moduleFilter } : {}),
      ...(q ? { OR: [{ objectId: { contains: q } }, { objectType: { contains: q } }, { user: { name: { contains: q } } }] } : {}),
    },
    include: { user: true, skpd: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return <>
    <AdminHeader title="Audit log" description="Catatan aktivitas sistem bersifat append-only untuk akuntabilitas dan pemeriksaan." />
    <div className={s.lock}><LockKeyhole size={17} aria-hidden="true" /><strong>Log immutable.</strong> Entri tidak dapat diedit atau dihapus melalui aplikasi.</div>
    <form className="filter-bar" method="get"><div className="filter-bar__search"><input name="q" defaultValue={q} aria-label="Cari audit" placeholder="Cari pelaku, objek, atau ID" /></div><Select name="module" defaultValue={moduleFilter ?? ""} aria-label="Modul"><option value="">Semua modul</option><option value="AUTH">Autentikasi</option><option value="BORROWING">Peminjaman</option><option value="RETURN">Pengembalian</option><option value="INVENTORY">Kendaraan</option></Select><button className="button button--primary button--md" type="submit">Terapkan</button></form>
    <Panel title="Kronologi sistem" description={`${entries.length} entri terbaru · zona waktu WITA`} flush><TableContainer><Table><TableHead><TableRow><TableHeader>Waktu / ID</TableHeader><TableHeader>Pelaku</TableHeader><TableHeader>Tindakan</TableHeader><TableHeader>Objek</TableHeader><TableHeader>SKPD</TableHeader><TableHeader>Alamat IP</TableHeader></TableRow></TableHead><TableBody>{entries.map((entry) => <TableRow key={entry.id}><TableCell><strong>{formatDateTime(entry.createdAt)} WITA</strong><div className={`${s.auditMeta} ${s.mono}`}>{entry.id}</div></TableCell><TableCell><strong>{entry.user?.name ?? "Sistem"}</strong><div><Badge tone="neutral">{entry.user?.role ?? "SYSTEM"}</Badge></div></TableCell><TableCell>{entry.action}</TableCell><TableCell><span className={s.mono}>{entry.objectId ?? "-"}</span><div className={s.auditMeta}>{entry.objectType} · {entry.module}</div></TableCell><TableCell>{entry.skpd.name}</TableCell><TableCell className={s.mono}>{entry.ipAddress ?? "-"}</TableCell></TableRow>)}</TableBody></Table></TableContainer>{!entries.length && <p className={s.empty}>Tidak ada entri audit yang sesuai filter.</p>}</Panel>
  </>;
}
