import { Plus, UserCog } from "lucide-react";
import { AdminHeader, Badge, Button, FilterBar, Panel, Select, Status, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, formatDateTime, s } from "@/components/admin/admin-ui";
import { users } from "@/lib/mock-data";

const roleLabel = { ADMIN: "ADMIN", BORROWER: "BORROWER", APPROVER: "APPROVER" } as const;

export default function UsersPage() {
  return <>
    <AdminHeader title="Pengguna dan akses" description="Kelola akun aparatur, peran, perangkat daerah, dan status akses SIPINTER." actions={<Button><Plus size={16} /> Tambah pengguna</Button>} />
    <section className={s.summaryStrip}>
      <div className={s.summaryItem}><span>Total akun</span><strong>218</strong><small>216 akun ASN</small></div>
      <div className={s.summaryItem}><span>Aktif</span><strong>204</strong><small>93,6% akun</small></div>
      <div className={s.summaryItem}><span>Administrator</span><strong>4</strong><small>Bagian Umum</small></div>
      <div className={s.summaryItem}><span>Sekda</span><strong>1</strong><small>Sekretariat Daerah</small></div>
      <div className={s.summaryItem}><span>Belum masuk 30 hari</span><strong>14</strong><small>Perlu peninjauan</small></div>
    </section>
    <FilterBar searchPlaceholder="Cari nama, NIP, email, atau SKPD">
      <Select aria-label="Peran"><option>Semua peran</option><option>ADMIN</option><option>BORROWER</option><option>APPROVER</option></Select>
      <Select aria-label="Status"><option>Semua status</option><option>Aktif</option><option>Nonaktif</option></Select>
      <Button variant="outline">Terapkan</Button>
    </FilterBar>
    <Panel title="Daftar pengguna" description="4 rekaman contoh dari 218 akun" flush>
      <TableContainer><Table><TableHead><TableRow><TableHeader>Pengguna</TableHeader><TableHeader>NIP</TableHeader><TableHeader>Perangkat daerah</TableHeader><TableHeader>Peran</TableHeader><TableHeader>Terakhir aktif</TableHeader><TableHeader>Status / Aksi</TableHeader></TableRow></TableHead><TableBody>{users.map((u) => <TableRow key={u.id}><TableCell><strong>{u.name}</strong><div className={s.compact}>{u.email}</div></TableCell><TableCell className={s.mono}>{u.nip}</TableCell><TableCell>{u.skpd}<div className={s.compact}>{u.unit}</div></TableCell><TableCell><Badge tone={u.role === "ADMIN" ? "maroon" : u.role === "APPROVER" ? "info" : "neutral"}>{roleLabel[u.role]}</Badge></TableCell><TableCell>{formatDateTime(u.lastActive)} WITA</TableCell><TableCell><Status value={u.status} /> <Button variant="ghost" size="sm"><UserCog size={14} /> Kelola</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
    </Panel>
  </>;
}
