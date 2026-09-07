import { Schema, model, models, type InferSchemaType } from "mongoose";

const GroupSchema = new Schema({
  name: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export type Group = InferSchemaType<typeof GroupSchema>;

export default models.Group || model("Group", GroupSchema);
