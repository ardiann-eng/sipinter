import { Role, UserStatus } from "@prisma/client";
import { AdminHeader, Badge, Panel, Status, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, formatDateTime, s } from "@/components/admin/admin-ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function UsersPage() {
  await requireRole([Role.ADMIN]);
  const users = await db.user.findMany({ include: { skpd: true }, orderBy: [{ status: "asc" }, { name: "asc" }] });
  const active = users.filter((user) => user.status === UserStatus.ACTIVE).length;
  const admins = users.filter((user) => user.role === Role.ADMIN).length;
  const approvers = users.filter((user) => user.role === Role.APPROVER).length;
  return <><AdminHeader title="Pengguna dan akses" description="Daftar akun aparatur, peran, perangkat daerah, dan status akses SIPINTER." /><section className={s.summaryStrip}><div className={s.summaryItem}><span>Total akun</span><strong>{users.length}</strong><small>Seluruh peran</small></div><div className={s.summaryItem}><span>Aktif</span><strong>{active}</strong><small>Akun dapat masuk</small></div><div className={s.summaryItem}><span>Administrator</span><strong>{admins}</strong><small>Pengelola kendaraan</small></div><div className={s.summaryItem}><span>Sekda</span><strong>{approvers}</strong><small>Pemberi persetujuan</small></div></section><Panel title="Daftar pengguna" description={`${users.length} akun tercatat`} flush><TableContainer><Table><TableHead><TableRow><TableHeader>Pengguna</TableHeader><TableHeader>NIP</TableHeader><TableHeader>Perangkat daerah</TableHeader><TableHeader>Peran</TableHeader><TableHeader>Terakhir masuk</TableHeader><TableHeader>Status</TableHeader></TableRow></TableHead><TableBody>{users.map((user) => <TableRow key={user.id}><TableCell><strong>{user.name}</strong><div className={s.compact}>{user.email}</div></TableCell><TableCell className={s.mono}>{user.nip}</TableCell><TableCell>{user.skpd.name}<div className={s.compact}>{user.position}</div></TableCell><TableCell><Badge tone={user.role === Role.ADMIN ? "maroon" : user.role === Role.APPROVER ? "info" : "neutral"}>{user.role}</Badge></TableCell><TableCell>{user.lastLoginAt ? `${formatDateTime(user.lastLoginAt)} WITA` : "Belum pernah"}</TableCell><TableCell><Status value={user.status} /></TableCell></TableRow>)}</TableBody></Table></TableContainer></Panel></>;
}
