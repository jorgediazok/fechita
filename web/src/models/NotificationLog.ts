import { Schema, model, models, type InferSchemaType } from "mongoose";

// Anti-duplicados de notificaciones push. Antes de mandar una notificación "de evento"
// (resultado de una fecha, insignia, cierre de fecha, recordatorio de carga), el sender
// intenta insertar acá; si el índice único rebota, ya se mandó y se saltea. Así un re-run
// del sync o un doble cierre no spamean. `kind` es el tipo, `dedupeKey` lo que la hace
// única dentro del tipo (roundKey, badgeId, groupId…).
const NotificationLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  kind: { type: String, required: true },
  dedupeKey: { type: String, required: true },
  // TTL: se limpian solas a los ~60 días (el dedupe solo importa a corto plazo).
  sentAt: { type: Date, default: Date.now, expires: 60 * 24 * 60 * 60 },
});

NotificationLogSchema.index({ userId: 1, kind: 1, dedupeKey: 1 }, { unique: true });

export type NotificationLog = InferSchemaType<typeof NotificationLogSchema>;

export default models.NotificationLog || model("NotificationLog", NotificationLogSchema);
