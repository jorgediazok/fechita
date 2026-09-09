import { Schema, model, models, type InferSchemaType } from "mongoose";
import { TIER_ORDER } from "@/lib/tiers";

// Un grupo de liga por FECHA del campeonato (no por semana calendario). Se genera un lote
// nuevo por (fecha, categoría) cada vez que arranca una fecha. `roundKey` = el campo
// Match.round, ej. "Fecha 9".
const RoundLeagueGroupSchema = new Schema({
  roundKey: { type: String, required: true },
  tier: { type: String, enum: TIER_ORDER, required: true },
  // Fallback: si un partido de la fecha queda colgado (postergado, sin dato), el grupo cierra
  // igual pasado esto (último kickoff de la fecha + 24h). Normalmente cierra antes, apenas
  // terminan todos los partidos de la fecha.
  closesAt: { type: Date, required: true },
  status: { type: String, enum: ["active", "closed"], default: "active" },
});

RoundLeagueGroupSchema.index({ roundKey: 1, tier: 1 });

export type RoundLeagueGroup = InferSchemaType<typeof RoundLeagueGroupSchema>;

export default models.RoundLeagueGroup || model("RoundLeagueGroup", RoundLeagueGroupSchema);
