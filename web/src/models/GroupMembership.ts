import { Schema, model, models, type InferSchemaType } from "mongoose";

const GroupMembershipSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  joinedAt: { type: Date, default: Date.now },
});

GroupMembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export type GroupMembership = InferSchemaType<typeof GroupMembershipSchema>;

export default models.GroupMembership || model("GroupMembership", GroupMembershipSchema);
