import "server-only";

import { BorrowingStatus, NotificationType, Role } from "@prisma/client";
import { db } from "./db";
import { getOperationalSettings } from "./operational-settings";
import type { SessionUser } from "./types";
import { markOverdueRequests } from "./workflow";

export async function runBorrowingMaintenance(actor: SessionUser, now = new Date()) {
  if (actor.role !== Role.ADMIN) return { overdue: 0, reminders: 0 };
  const settings = await getOperationalSettings();
  const overdue = settings.overdueEscalation ? await markOverdueRequests(actor, now) : 0;
  let reminders = 0;
  if (settings.returnReminder) {
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const due = await db.borrowingRequest.findMany({
      where: { status: BorrowingStatus.BORROWED, plannedReturnDate: { gte: now, lte: end } },
      select: { id: true, borrowerId: true, registrationNumber: true, plannedReturnDate: true },
    });
    for (const request of due) {
      const exists = await db.notification.findFirst({
        where: { userId: request.borrowerId, title: "Pengingat pengembalian kendaraan", link: `/peminjam/pengembalian/${request.id}`, createdAt: { gte: startOfDay } },
        select: { id: true },
      });
      if (!exists) {
        await db.notification.create({ data: { userId: request.borrowerId, type: NotificationType.WARNING, title: "Pengingat pengembalian kendaraan", message: `${request.registrationNumber} harus dikembalikan paling lambat hari ini atau dalam 24 jam.`, link: `/peminjam/pengembalian/${request.id}` } });
        reminders += 1;
      }
    }
  }
  return { overdue, reminders };
}
