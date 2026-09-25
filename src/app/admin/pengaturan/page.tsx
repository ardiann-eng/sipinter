import { Role } from "@prisma/client";
import { AdminHeader } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  await requireRole([Role.ADMIN]);
  const settings = await db.setting.findMany({ where: { key: { in: ["standardDurationDays", "minimumLeadDays", "returnReminder", "overdueEscalation"] } } });
  const values = new Map(settings.map((setting) => [setting.key, setting.value]));
  return <><AdminHeader title="Pengaturan administrasi" description="Atur parameter operasional peminjaman kendaraan." /><SettingsForm initial={{ standardDurationDays: Number(values.get("standardDurationDays") ?? 7), minimumLeadDays: Number(values.get("minimumLeadDays") ?? 2), returnReminder: Boolean(values.get("returnReminder") ?? true), overdueEscalation: Boolean(values.get("overdueEscalation") ?? true) }} /></>;
}
