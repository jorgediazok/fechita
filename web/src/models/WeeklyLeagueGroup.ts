import { Schema, model, models, type InferSchemaType } from "mongoose";
import { TIER_ORDER } from "@/lib/tiers";

const WeeklyLeagueGroupSchema = new Schema({
  // Semana ISO en America/Argentina/Buenos_Aires, ej. "2026-W37".
  weekKey: { type: String, required: true },
  tier: { type: String, enum: TIER_ORDER, required: true },
  closesAt: { type: Date, required: true },
  status: { type: String, enum: ["active", "closed"], default: "active" },
});

WeeklyLeagueGroupSchema.index({ weekKey: 1, tier: 1 });

export type WeeklyLeagueGroup = InferSchemaType<typeof WeeklyLeagueGroupSchema>;

export default models.WeeklyLeagueGroup || model("WeeklyLeagueGroup", WeeklyLeagueGroupSchema);
