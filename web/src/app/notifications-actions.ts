"use server";

import { getCurrentUser } from "@/lib/session";
import { getNotifications, getUnreadCount, markAllRead, type FeedNotification } from "@/lib/notifications";

export type NotificationsResult =
  | { user: false }
  | { user: true; items: FeedNotification[]; unread: number };

export async function fetchNotifications(): Promise<NotificationsResult> {
  const user = await getCurrentUser();
  if (!user) return { user: false };
  const [items, unread] = await Promise.all([
    getNotifications(user._id),
    getUnreadCount(user._id),
  ]);
  return { user: true, items, unread };
}

export async function markNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await markAllRead(user._id);
}
