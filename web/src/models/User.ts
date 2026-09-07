import { Schema, model, models, type InferSchemaType } from "mongoose";
import { TIER_ORDER } from "@/lib/tiers";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  favoriteTeamId: { type: Schema.Types.ObjectId, ref: "Team" },
  avatarUrl: { type: String },
  // Solo la tienen los usuarios registrados con email/password (Credentials).
  // Los que entran por Google no tienen este campo.
  passwordHash: { type: String },
  // Categoría de la liga semanal (capa 3). Persiste entre semanas aunque las
  // ligas en sí se resetean — ver docs/product-design.md.
  currentTier: { type: String, enum: TIER_ORDER, default: "D" },
  createdAt: { type: Date, default: Date.now },
});

export type User = InferSchemaType<typeof UserSchema>;

export default models.User || model("User", UserSchema);
