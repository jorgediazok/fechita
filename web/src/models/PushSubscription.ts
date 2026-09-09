import { Schema, model, models, type InferSchemaType } from "mongoose";

// Una suscripción a web push por dispositivo/navegador. El `endpoint` (URL única que da el
// navegador) es la identidad — un mismo usuario puede tener varias (celu + desktop). Las
// filas muertas (el navegador devolvió 404/410 al mandar) se borran en el sender.
const PushSubscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  ua: { type: String },
  failureCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export type PushSubscription = InferSchemaType<typeof PushSubscriptionSchema>;

export default models.PushSubscription || model("PushSubscription", PushSubscriptionSchema);
