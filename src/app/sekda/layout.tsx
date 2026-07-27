import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { Role } from "@prisma/client";
import "./sekda.css";

export default async function SekdaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole([Role.APPROVER]);
  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        role: "APPROVER",
        unit: "Sekretariat Daerah Kota Makassar",
      }}
      notificationCount={await getUnreadNotificationCount(user.id)}
    >
      {children}
    </AppShell>
  );
}
