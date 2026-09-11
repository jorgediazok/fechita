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
  // Fecha en que se confirmó el email (null = sin confirmar). Los usuarios de Google lo traen
  // seteado desde el alta (Google ya verificó el mail); los de Credentials lo confirman con el
  // link que manda sendVerificationEmail (src/lib/emailVerification.ts). No bloquea el login —
  // solo "participar" (cargar pronósticos, crear/unirse a un grupo) lo exige.
  emailVerified: { type: Date, default: null },
  // Categoría de la liga (capa 3). Persiste entre fechas aunque las
  // ligas en sí se resetean — ver docs/product-design.md.
  currentTier: { type: String, enum: TIER_ORDER, default: "D" },
  // La categoría más alta que el usuario alcanzó alguna vez ("tu techo", visible en el
  // perfil). Se actualiza al ascender y nunca baja. Arranca en "D" como currentTier.
  bestTier: { type: String, enum: TIER_ORDER, default: "D" },
  // Usuario "bot" para dar vida a las ligas mientras haya pocos jugadores reales:
  // pronostica solo antes de cada kickoff (ver src/lib/bots/) y asciende/desciende
  // como cualquiera. botSkill (0..1) regula qué tan seguido le pega — solo en bots.
  isBot: { type: Boolean, default: false },
  botSkill: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export type User = InferSchemaType<typeof UserSchema>;

export default models.User || model("User", UserSchema);
