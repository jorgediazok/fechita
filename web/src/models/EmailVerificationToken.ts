import { Schema, model, models, type InferSchemaType } from "mongoose";

// Token de un solo uso para confirmar el email de una cuenta credentials (los de Google ya
// vienen con el mail verificado por Google — ver auth.ts). TTL de 24h: pasado ese tiempo el
// link vence solo y hay que reenviarlo (resendVerificationEmail).
const EmailVerificationTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 24 * 60 * 60 },
});

export type EmailVerificationToken = InferSchemaType<typeof EmailVerificationTokenSchema>;

export default models.EmailVerificationToken ||
  model("EmailVerificationToken", EmailVerificationTokenSchema);
