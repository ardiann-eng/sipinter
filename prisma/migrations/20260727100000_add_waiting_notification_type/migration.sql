-- SQLite stores enum values as TEXT, so WAITING needs no table alteration.
-- Index matches notification-center lookup: one user's latest notifications.
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx"
ON "Notification"("userId", "createdAt");
