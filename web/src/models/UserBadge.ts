import { Schema, model, models, type InferSchemaType } from "mongoose";

// Insignias ganadas por un usuario (capa aditiva — ver docs/product-design.md).
// El catálogo de insignias vive en código (src/lib/badges/catalog.ts), igual que las
// categorías de liga; acá solo se guarda qué usuario ganó qué y cuándo. Que exista el
// documento ES el registro de "primera vez" (ej. el primer ascenso a la C queda aunque
// después baje). `seen` marca si ya se le mostró el festejo — lo usa el overlay de
// /pronosticos, calcado de cómo getPendingLeagueResult maneja el anuncio de ascenso.
const UserBadgeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  badgeId: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false },
});

UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export type UserBadge = InferSchemaType<typeof UserBadgeSchema>;

export default models.UserBadge || model("UserBadge", UserBadgeSchema);
