import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import GroupModel from "@/models/Group";
import GroupMembershipModel from "@/models/GroupMembership";
import PredictionModel from "@/models/Prediction";

// Sin 0/O ni 1/I para que no se confundan al compartir el código a mano.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

async function generateInviteCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const existing = await GroupModel.findOne({ inviteCode: code });
    if (!existing) return code;
  }
  throw new Error("No se pudo generar un código de invitación único");
}

export async function createGroup(userId: Types.ObjectId | string, name: string) {
  await connectToDatabase();
  const inviteCode = await generateInviteCode();
  const group = await GroupModel.create({ name, inviteCode, ownerId: userId });
  await GroupMembershipModel.create({ groupId: group._id, userId });
  return group;
}

export async function joinGroupByCode(userId: Types.ObjectId | string, code: string) {
  await connectToDatabase();
  const group = await GroupModel.findOne({ inviteCode: code.trim().toUpperCase() });
  if (!group) {
    throw new Error("No existe ningún grupo con ese código");
  }

  const existing = await GroupMembershipModel.findOne({ groupId: group._id, userId });
  if (!existing) {
    await GroupMembershipModel.create({ groupId: group._id, userId });
  }
  return group;
}

export async function leaveGroup(userId: Types.ObjectId | string, groupId: Types.ObjectId | string) {
  await connectToDatabase();
  await GroupMembershipModel.deleteOne({ groupId, userId });
}

export async function getUserGroups(userId: Types.ObjectId | string) {
  await connectToDatabase();
  const memberships = await GroupMembershipModel.find({ userId }).populate("groupId");
  return Promise.all(
    memberships
      .filter((m) => m.groupId)
      .map(async (m) => ({
        group: m.groupId as unknown as InstanceType<typeof GroupModel>,
        memberCount: await GroupMembershipModel.countDocuments({ groupId: m.groupId }),
      }))
  );
}

export async function getGroupLeaderboard(groupId: Types.ObjectId | string) {
  await connectToDatabase();
  const memberships = await GroupMembershipModel.find({ groupId }).populate({
    path: "userId",
    select: "name favoriteTeamId",
    populate: { path: "favoriteTeamId", select: "name shortName logoUrl" },
  });

  const totals = await PredictionModel.aggregate<{ _id: Types.ObjectId; total: number }>([
    { $match: { userId: { $in: memberships.map((m) => m.userId._id) }, points: { $ne: null } } },
    { $group: { _id: "$userId", total: { $sum: "$points" } } },
  ]);
  const totalsMap = new Map(totals.map((t) => [String(t._id), t.total]));

  return memberships
    .map((m) => ({ membership: m, user: m.userId, points: totalsMap.get(String(m.userId._id)) ?? 0 }))
    .sort((a, b) => b.points - a.points);
}
