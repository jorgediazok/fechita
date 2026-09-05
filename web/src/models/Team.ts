import { Schema, model, models, type InferSchemaType } from "mongoose";

const TeamSchema = new Schema({
  externalId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  logoUrl: { type: String, required: true },
  country: { type: String, required: true },
});

export type Team = InferSchemaType<typeof TeamSchema>;

export default models.Team || model("Team", TeamSchema);
