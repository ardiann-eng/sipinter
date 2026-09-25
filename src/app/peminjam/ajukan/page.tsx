import { PageHeader } from "@/components";
import { LoanForm } from "@/components/borrower/loan-form";
import styles from "@/components/borrower/borrower.module.css";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export default async function ApplyPage() {
  const user = await requireRole([Role.BORROWER]);
  const [profile, records] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: user.id }, include: { skpd: true } }),
    db.item.findMany({ where: { status: "AVAILABLE", availableQuantity: { gt: 0 } }, orderBy: { name: "asc" } }),
  ]);
  const items = records.map((item) => ({ id: item.id, name: item.name, code: item.itemCode, registrationNumber: item.itemCode, category: "Kendaraan Dinas", location: item.location, unit: item.unit, availableStock: item.availableQuantity, totalStock: item.totalQuantity, condition: item.condition, status: "AVAILABLE" as const, imageUrl: item.mainPhoto ?? undefined, description: item.description ?? undefined }));
  const borrower = { name: profile.name, nip: profile.nip, email: profile.email, phone: profile.phone ?? "-", unit: profile.position, skpd: profile.skpd.name, employeeId: profile.id };
  return <div className={styles.page}><PageHeader eyebrow="Pengajuan kendaraan" title="Ajukan Peminjaman Kendaraan" description="Pilih kendaraan sesuai jumlah penumpang, lalu lengkapi jadwal dan dokumen perjalanan dinas." /><LoanForm borrower={borrower} items={items} /></div>;
}
