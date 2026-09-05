import { Schema, model, models, type InferSchemaType } from "mongoose";

const CompetitionSchema = new Schema({
  externalId: { type: Number, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  season: { type: Number, required: true },
  logoUrl: { type: String, required: true },
});

CompetitionSchema.index({ externalId: 1, season: 1 }, { unique: true });

export type Competition = InferSchemaType<typeof CompetitionSchema>;

export default models.Competition || model("Competition", CompetitionSchema);
