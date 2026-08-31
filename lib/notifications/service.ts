import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/src/db";
import { notifications, type Notification } from "@/src/db/schema";
import { publishNotification } from "@/lib/notifications/hub";

const RETENTION_DAYS = 7;
const PURGE_DEBOUNCE_MS = 60 * 60 * 1000; // purge at most once per hour per process
let lastPurgeAt = 0;

export type CreateNotificationInput = {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  meta?: Record<string, unknown>;
};

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  await db.insert(notifications).values({
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    meta: input.meta ?? null,
  });
  await publishUnreadCount();
}

export async function countUnreadNotifications(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(eq(notifications.isRead, false));
  return Number(row?.count ?? 0);
}

/** Broadcast the current unread count to every connected SSE client. */
async function publishUnreadCount(): Promise<void> {
  publishNotification({ unreadCount: await countUnreadNotifications() });
}

export async function listRecentNotifications(
  limit = 5,
): Promise<{ items: Notification[]; unreadCount: number }> {
  await purgeOldNotifications();

  const items = await db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return {
    items,
    unreadCount: await countUnreadNotifications(),
  };
}

export async function markNotificationsRead(): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.isRead, false));
  await publishUnreadCount();
}

async function purgeOldNotifications(): Promise<void> {
  const now = Date.now();
  if (now - lastPurgeAt < PURGE_DEBOUNCE_MS) return;
  lastPurgeAt = now;
  await db
    .delete(notifications)
    .where(
      sql`${notifications.createdAt} < now() - interval '${sql.raw(String(RETENTION_DAYS))} days'`,
    );
}
