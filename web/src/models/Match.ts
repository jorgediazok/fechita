import { Schema, model, models, type InferSchemaType } from "mongoose";

export const MATCH_STATUSES = [
  "scheduled",
  "live",
  "finished",
  "postponed",
  "cancelled",
] as const;

const MatchSchema = new Schema({
  externalId: { type: Number, required: true, unique: true },
  competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
  round: { type: String, required: true },
  homeTeamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  awayTeamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  kickoffAt: { type: Date, required: true },
  status: { type: String, enum: MATCH_STATUSES, required: true, default: "scheduled" },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  lastSyncedAt: { type: Date, required: true },
});

export type Match = InferSchemaType<typeof MatchSchema>;

export default models.Match || model("Match", MatchSchema);
