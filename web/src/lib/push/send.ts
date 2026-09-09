import { connectToDatabase } from "@/lib/db";
import PushSubscriptionModel from "@/models/PushSubscription";
import NotificationLogModel from "@/models/NotificationLog";
import { ensureWebPushConfigured, isPushConfigured, webpush } from "./keys";
import type { PushPayload } from "./messages";

const MAX_FAILURES = 3;

type SubJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeUser(userId: string, sub: SubJSON, ua?: string) {
  await connectToDatabase();
  await PushSubscriptionModel.findOneAndUpdate(
    { endpoint: sub.endpoint },
    {
      userId,
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      ua,
      failureCount: 0,
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

export async function unsubscribeUser(userId: string, endpoint?: string) {
  await connectToDatabase();
  await PushSubscriptionModel.deleteMany(
    endpoint ? { userId, endpoint } : { userId }
  );
}

// ¿El usuario tiene al menos un dispositivo suscrito? (para pintar el toggle de /perfil)
export async function userHasPush(userId: string) {
  await connectToDatabase();
  return Boolean(await PushSubscriptionModel.exists({ userId }));
}

type DedupeOpts = { kind: string; dedupeKey: string };

// Manda una notificación a todos los dispositivos de un usuario. Tolerante a fallos: nunca
// lanza. Si se pasa `dedupe`, registra en NotificationLog primero y no manda si ya se envió.
export async function sendToUser(
  userId: string,
  payload: PushPayload,
  dedupe?: DedupeOpts
): Promise<void> {
  if (!isPushConfigured()) return;
  ensureWebPushConfigured();

  try {
    await connectToDatabase();

    if (dedupe) {
      try {
        await NotificationLogModel.create({
          userId,
          kind: dedupe.kind,
          dedupeKey: dedupe.dedupeKey,
        });
      } catch (err: unknown) {
        // 11000 = clave duplicada → ya se mandó esta notificación, saltear.
        if ((err as { code?: number })?.code === 11000) return;
        throw err;
      }
    }

    const subs = await PushSubscriptionModel.find({ userId });
    if (subs.length === 0) return;

    const body = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
            body
          );
          if (sub.failureCount) {
            sub.failureCount = 0;
            await sub.save();
          }
        } catch (err: unknown) {
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) {
            await sub.deleteOne();
            return;
          }
          sub.failureCount = (sub.failureCount ?? 0) + 1;
          if (sub.failureCount >= MAX_FAILURES) await sub.deleteOne();
          else await sub.save();
        }
      })
    );
  } catch (err) {
    console.warn("[push] sendToUser falló:", err);
  }
}

export async function sendToUsers(
  userIds: string[],
  payloadFor: (userId: string) => PushPayload | null,
  dedupeFor?: (userId: string) => DedupeOpts | undefined
): Promise<void> {
  for (const userId of userIds) {
    const payload = payloadFor(userId);
    if (payload) await sendToUser(userId, payload, dedupeFor?.(userId));
  }
}
