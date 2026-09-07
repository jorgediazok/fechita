import { Schema, model, models, type InferSchemaType } from "mongoose";

const LeagueMembershipSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "WeeklyLeagueGroup", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  // Snapshot final al cerrar la semana. Mientras el grupo sigue activo, el
  // standing en vivo se calcula aparte (ver getLivePoints en lib/leagues.ts).
  points: { type: Number, default: 0 },
  result: { type: String, enum: ["promoted", "relegated", "stayed"], default: null },
  createdAt: { type: Date, default: Date.now },
});

LeagueMembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export type LeagueMembership = InferSchemaType<typeof LeagueMembershipSchema>;

export default models.LeagueMembership || model("LeagueMembership", LeagueMembershipSchema);
