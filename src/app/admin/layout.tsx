import { AppShell } from "@/components";
import { s } from "@/components/admin/admin-ui";
import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { Role } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole([Role.ADMIN]);
  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        role: "ADMIN",
        unit: "Pemerintah Kota Makassar",
      }}
      notificationCount={await getUnreadNotificationCount(user.id)}
    >
      <div className={s.workspace}>{children}</div>
    </AppShell>
  );
}
