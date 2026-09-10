import webpush from "web-push";

const PUBLIC = process.env.VAPID_PUBLIC_KEY;
const PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:hola@fechita.app";

let configured = false;

// Sin las VAPID keys, todo el subsistema de push queda inerte y la app funciona igual.
export function isPushConfigured() {
  return Boolean(PUBLIC && PRIVATE);
}

// Idempotente: setea los detalles VAPID en `web-push` la primera vez que se necesita.
export function ensureWebPushConfigured() {
  if (configured || !isPushConfigured()) return configured;
  webpush.setVapidDetails(SUBJECT, PUBLIC!, PRIVATE!);
  configured = true;
  return true;
}

export { webpush };
