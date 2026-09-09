"use server";

import { getCurrentUser } from "@/lib/session";
import { subscribeUser, unsubscribeUser, sendToUser } from "@/lib/push/send";
import { testMessage } from "@/lib/push/messages";

type SubJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(sub: SubJSON, ua?: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const };
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return { ok: false as const };
  }
  await subscribeUser(String(user._id), sub, ua);
  return { ok: true as const };
}

export async function removePushSubscription(endpoint?: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const };
  await unsubscribeUser(String(user._id), endpoint);
  return { ok: true as const };
}

export async function sendTestNotification() {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const };
  await sendToUser(String(user._id), testMessage());
  return { ok: true as const };
}
