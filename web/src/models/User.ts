import { Schema, model, models, type InferSchemaType } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  favoriteTeamId: { type: Schema.Types.ObjectId, ref: "Team" },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export type User = InferSchemaType<typeof UserSchema>;

export default models.User || model("User", UserSchema);
