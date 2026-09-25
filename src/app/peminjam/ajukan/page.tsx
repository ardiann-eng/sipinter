import { notFound } from "next/navigation";
import { BorrowingStatus, Role } from "@prisma/client";
import { PageHeader } from "@/components";
import { LoanForm } from "@/components/borrower/loan-form";
import styles from "@/components/borrower/borrower.module.css";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOperationalSettings } from "@/lib/operational-settings";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ revision?: string }> }) {
  const [user, params, policy] = await Promise.all([requireRole([Role.BORROWER]), searchParams, getOperationalSettings()]);
  const revision = params.revision
    ? await db.borrowingRequest.findFirst({
        where: { id: params.revision, borrowerId: user.id, status: BorrowingStatus.REVISION_REQUIRED },
        include: { items: true },
      })
    : null;
  if (params.revision && !revision) notFound();
  const selectedIds = revision?.items.map((entry) => entry.itemId) ?? [];
  const [profile, records] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: user.id }, include: { skpd: true } }),
    db.item.findMany({
      where: { OR: [{ status: "AVAILABLE", availableQuantity: { gt: 0 } }, ...(selectedIds.length ? [{ id: { in: selectedIds } }] : [])] },
      orderBy: [{ name: "asc" }, { itemCode: "asc" }],
    }),
  ]);
  const selectedQuantities = new Map(revision?.items.map((entry) => [entry.itemId, entry.quantity]) ?? []);
  const items = records.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.itemCode,
    registrationNumber: item.registrationNumber ?? item.itemCode,
    category: "Kendaraan Dinas",
    location: item.location,
    unit: item.unit,
    availableStock: Math.max(item.availableQuantity, selectedQuantities.get(item.id) ?? 0),
    totalStock: item.totalQuantity,
    condition: item.condition,
    status: "AVAILABLE" as const,
    imageUrl: item.mainPhoto ?? undefined,
    description: item.description ?? undefined,
  }));
  const borrower = { name: profile.name, nip: profile.nip, email: profile.email, phone: profile.phone ?? "-", unit: profile.position, skpd: profile.skpd.name, employeeId: profile.id };
  const revisionDraft = revision ? {
    id: revision.id,
    purpose: revision.purpose,
    location: revision.activityLocation,
    startDate: revision.borrowDate.toISOString().slice(0, 10),
    endDate: revision.plannedReturnDate.toISOString().slice(0, 10),
    items: Object.fromEntries(revision.items.map((entry) => [entry.itemId, entry.quantity])),
    hasKtp: Boolean(revision.ktpFile),
    hasSupporting: Boolean(revision.approvalLetterFile),
    adminNote: revision.adminNote ?? undefined,
  } : undefined;
  return <div className={styles.page}><PageHeader eyebrow={revision ? "Perbaikan pengajuan" : "Pengajuan kendaraan"} title={revision ? `Revisi ${revision.registrationNumber}` : "Ajukan Peminjaman Kendaraan"} description={revision ? "Perbarui pengajuan yang sama sesuai catatan administrator." : "Pilih kendaraan sesuai jumlah penumpang, lalu lengkapi jadwal dan dokumen perjalanan dinas."} /><LoanForm borrower={borrower} items={items} revision={revisionDraft} policy={policy} /></div>;
}
