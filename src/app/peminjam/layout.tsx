import { AppShell } from "@/components";
import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { Role } from "@prisma/client";

export default async function BorrowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole([Role.BORROWER]);
  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        role: "BORROWER",
        unit: "Pemerintah Kota Makassar",
      }}
      notificationCount={await getUnreadNotificationCount(user.id)}
    >
      {children}
    </AppShell>
  );
}
