import { Schema, model, models, type InferSchemaType } from "mongoose";

// Doble función:
//  1. Anti-duplicados de notificaciones: antes de mandar una notificación "de evento"
//     (fin de fecha, insignia, cierre de grupo, recordatorio) el sender intenta insertar
//     acá; si el índice único rebota, ya se mandó y se saltea. `kind` es el tipo,
//     `dedupeKey` lo que la hace única dentro del tipo (roundKey, badgeId, groupId…).
//  2. Feed de novedades in-app (la campanita): `title`/`body`/`url` son el texto ya
//     renderizado del evento, `readAt` marca si el usuario ya la vio. Las notificaciones
//     de prueba (sin dedupe) NO se guardan acá.
const NotificationLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  kind: { type: String, required: true },
  dedupeKey: { type: String, required: true },
  title: { type: String },
  body: { type: String },
  url: { type: String },
  readAt: { type: Date, default: null },
  // TTL: se limpian solas a los ~60 días.
  sentAt: { type: Date, default: Date.now, expires: 60 * 24 * 60 * 60 },
});

NotificationLogSchema.index({ userId: 1, kind: 1, dedupeKey: 1 }, { unique: true });

export type NotificationLog = InferSchemaType<typeof NotificationLogSchema>;

export default models.NotificationLog || model("NotificationLog", NotificationLogSchema);
