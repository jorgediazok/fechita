import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import NotificationLogModel from "@/models/NotificationLog";

export type FeedNotification = {
  id: string;
  title: string;
  body: string;
  url: string;
  sentAt: string;
  readAt: string | null;
};

// El feed solo muestra filas con texto (`title`) — ignora filas viejas de dev que se
// crearon antes de este cambio, cuando NotificationLog era solo el anti-duplicados.
const HAS_TEXT = { title: { $exists: true, $ne: null } };

export async function getNotifications(
  userId: Types.ObjectId | string,
  limit = 30
): Promise<FeedNotification[]> {
  await connectToDatabase();
  const rows = await NotificationLogModel.find({ userId, ...HAS_TEXT })
    .sort({ sentAt: -1 })
    .limit(limit)
    .lean();

  return rows.map((r) => ({
    id: String(r._id),
    title: r.title ?? "",
    body: r.body ?? "",
    url: r.url || "/pronosticos",
    sentAt: new Date(r.sentAt as Date).toISOString(),
    readAt: r.readAt ? new Date(r.readAt).toISOString() : null,
  }));
}

export async function getUnreadCount(userId: Types.ObjectId | string): Promise<number> {
  await connectToDatabase();
  return NotificationLogModel.countDocuments({ userId, readAt: null, ...HAS_TEXT });
}

export async function markAllRead(userId: Types.ObjectId | string): Promise<void> {
  await connectToDatabase();
  await NotificationLogModel.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } }
  );
}
