import "server-only";

import { NotificationType } from "@prisma/client";
import { db } from "./db";

export type NotificationPriority = "ACTION" | "WAITING" | "INFO";

export interface AppNotification {
  id: string;
  priority: NotificationPriority;
  title: string;
  message: string;
  time: Date;
  href?: string;
  actionLabel?: string;
  unread: boolean;
}

function priorityFor(type: NotificationType): NotificationPriority {
  if (type === NotificationType.WAITING) return "WAITING";
  if (type === NotificationType.INFO) return "INFO";
  return "ACTION";
}

function actionLabelFor(priority: NotificationPriority, href?: string) {
  if (!href) return undefined;
  if (priority === "ACTION") return "Buka tindakan";
  if (priority === "WAITING") return "Lihat status";
  return "Buka informasi";
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications.map((notification) => {
    const priority = priorityFor(notification.type);
    return {
      id: notification.id,
      priority,
      title: notification.title,
      message: notification.message,
      time: notification.createdAt,
      href: notification.link ?? undefined,
      actionLabel: actionLabelFor(priority, notification.link ?? undefined),
      unread: notification.readAt === null,
    };
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}
