import { Schema, model, models, type InferSchemaType } from "mongoose";

const LeagueMembershipSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "RoundLeagueGroup", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  // Snapshot final al cerrar la fecha. Mientras el grupo sigue activo, el standing en vivo
  // se calcula aparte (ver getLivePoints en lib/leagues.ts).
  points: { type: Number, default: 0 },
  result: { type: String, enum: ["promoted", "relegated", "stayed"], default: null },
  // El #1 del grupo al cerrar la fecha. Alimenta el highlight "ganador de la fecha" y, más
  // adelante, una insignia.
  wonRound: { type: Boolean, default: false },
  // Si ya se le mostró al usuario el anuncio de ascenso/descenso de este resultado
  // (ver getPendingLeagueResult en lib/leagues.ts) — evita repetirlo en cada visita.
  resultAcknowledged: { type: Boolean, default: false },
  // Racha de fechas del usuario justo después de cerrar esta (fechas seguidas acertando
  // +50%). Snapshot para poder festejar cuando crece — ver getPendingStreak en lib/profile.
  streakAfter: { type: Number, default: null },
  streakSeen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

LeagueMembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export type LeagueMembership = InferSchemaType<typeof LeagueMembershipSchema>;

export default models.LeagueMembership || model("LeagueMembership", LeagueMembershipSchema);
