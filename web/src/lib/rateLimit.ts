import { headers } from "next/headers";
import { connectToDatabase } from "./db";
import RateLimitHitModel from "@/models/RateLimitHit";

// IP del cliente detrás del proxy de Vercel. x-forwarded-for puede traer una cadena
// "cliente, proxy1, proxy2" — el primero es el real. Sin ninguno de los dos headers (dev
// local sin proxy), cae a "local" — todas las requests locales comparten bucket, que es lo
// que querés en dev.
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "local";
}

// Ventana deslizante simple sobre Mongo (sin Redis): cuenta hits de `key` en los últimos
// `windowMs` y, si no se pasó el límite, registra este intento. TTL de 60 min en el modelo
// limpia la colección sola. Pensado para signup/login — volumen bajo, no hace falta más.
export async function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): Promise<{ allowed: boolean }> {
  await connectToDatabase();
  const since = new Date(Date.now() - windowMs);
  const count = await RateLimitHitModel.countDocuments({ key, createdAt: { $gte: since } });
  if (count >= max) return { allowed: false };
  await RateLimitHitModel.create({ key });
  return { allowed: true };
}
