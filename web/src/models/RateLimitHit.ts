import { Schema, model, models, type InferSchemaType } from "mongoose";

// Un documento por intento (signup, login) — src/lib/rateLimit.ts cuenta cuántos hits tiene
// una key en la ventana de tiempo pedida. TTL de 1h: alcanza para cualquier ventana que usemos
// hoy (las más largas son de 60 min) y la colección se limpia sola, sin cron aparte.
const RateLimitHitSchema = new Schema({
  key: { type: String, required: true }, // ej. "signup:<ip>", "login:<ip>"
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 },
});

RateLimitHitSchema.index({ key: 1, createdAt: 1 });

export type RateLimitHit = InferSchemaType<typeof RateLimitHitSchema>;

export default models.RateLimitHit || model("RateLimitHit", RateLimitHitSchema);
