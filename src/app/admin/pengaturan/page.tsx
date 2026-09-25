import { Role } from "@prisma/client";
import { AdminHeader } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireRole } from "@/lib/auth";
import { getOperationalSettings } from "@/lib/operational-settings";

export default async function SettingsPage() {
  await requireRole([Role.ADMIN]);
  const settings = await getOperationalSettings();
  return <><AdminHeader title="Pengaturan administrasi" description="Atur parameter operasional peminjaman kendaraan." /><SettingsForm initial={settings} /></>;
}
