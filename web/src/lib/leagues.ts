import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import WeeklyLeagueGroupModel from "@/models/WeeklyLeagueGroup";
import LeagueMembershipModel from "@/models/LeagueMembership";
import UserModel from "@/models/User";
import PredictionModel from "@/models/Prediction";
import {
  TIER_ORDER,
  TIER_LABELS,
  TIER_FULL_NAMES,
  tierCanPromote,
  tierCanRelegate,
  nextTierUp,
  nextTierDown,
  type TierCode,
} from "./tiers";

export { TIER_ORDER, TIER_LABELS, TIER_FULL_NAMES, tierCanPromote, tierCanRelegate, type TierCode };

// Argentina no usa horario de verano desde 2009 — UTC-3 fijo, así que el
// cálculo de semana no necesita lidiar con corrimientos de DST.
const ART_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function mondayKeyFor(date: Date): string {
  const shifted = new Date(date.getTime() - ART_OFFSET_MS);
  const dayOfWeek = shifted.getUTCDay(); // 0 = domingo .. 6 = sábado
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const artMondayUtcMidnight = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - daysSinceMonday
  );
  return new Date(artMondayUtcMidnight).toISOString().slice(0, 10);
}

export function getWeekBoundsForKey(weekKey: string) {
  const [y, m, d] = weekKey.split("-").map(Number);
  const artMondayUtcMidnight = Date.UTC(y, m - 1, d);
  const weekStart = new Date(artMondayUtcMidnight + ART_OFFSET_MS);
  const weekEnd = new Date(artMondayUtcMidnight + 7 * DAY_MS + ART_OFFSET_MS);
  return { weekStart, weekEnd };
}

export function getWeekBounds(date: Date = new Date()) {
  const weekKey = mondayKeyFor(date);
  const { weekStart, weekEnd } = getWeekBoundsForKey(weekKey);
  return { weekKey, weekStart, weekEnd };
}

// Tamaño de la zona de ascenso/descenso: ~25% del grupo, clampeado para que
// un grupo chico (dev, pocos usuarios) nunca promueva y descienda a la misma
// persona. Con un grupo de 20-25 da ~5, calzando con el "top 5 / últimos 5"
// del doc de producto. La página de liga usa el mismo criterio para que lo
// que el usuario ve coincida con lo que va a pasar al cerrar la semana.
export function zoneSize(memberCount: number) {
  if (memberCount <= 1) return 0;
  const target = Math.round(memberCount * 0.25);
  return Math.min(Math.max(target, 1), Math.floor(memberCount / 2));
}

async function getLivePoints(userIds: Types.ObjectId[], weekStart: Date, weekEnd: Date) {
  if (userIds.length === 0) return new Map<string, number>();

  const rows = await PredictionModel.aggregate<{ _id: Types.ObjectId; total: number }>([
    { $match: { userId: { $in: userIds }, points: { $ne: null } } },
    {
      $lookup: {
        from: "matches",
        localField: "matchId",
        foreignField: "_id",
        as: "match",
      },
    },
    { $unwind: "$match" },
    { $match: { "match.kickoffAt": { $gte: weekStart, $lt: weekEnd } } },
    { $group: { _id: "$userId", total: { $sum: "$points" } } },
  ]);

  return new Map(rows.map((r) => [String(r._id), r.total]));
}

export async function getGroupStanding(groupId: Types.ObjectId, weekKey: string) {
  const memberships = await LeagueMembershipModel.find({ groupId });
  const { weekStart, weekEnd } = getWeekBoundsForKey(weekKey);
  const pointsMap = await getLivePoints(
    memberships.map((m) => m.userId),
    weekStart,
    weekEnd
  );
  return memberships
    .map((m) => ({ membership: m, points: pointsMap.get(String(m.userId)) ?? 0 }))
    .sort((a, b) => b.points - a.points);
}

async function closeGroup(group: InstanceType<typeof WeeklyLeagueGroupModel>) {
  const ranked = await getGroupStanding(group._id, group.weekKey);
  const size = zoneSize(ranked.length);
  const canPromote = tierCanPromote(group.tier as TierCode);
  const canRelegate = tierCanRelegate(group.tier as TierCode);

  for (let i = 0; i < ranked.length; i++) {
    const { membership, points } = ranked[i];
    let result: "promoted" | "relegated" | "stayed" = "stayed";
    if (canPromote && i < size) {
      result = "promoted";
    } else if (canRelegate && i >= ranked.length - size) {
      result = "relegated";
    }

    membership.points = points;
    membership.result = result;
    await membership.save();

    const user = await UserModel.findById(membership.userId);
    if (!user) continue;
    if (result === "promoted") user.currentTier = nextTierUp(group.tier as TierCode);
    else if (result === "relegated") user.currentTier = nextTierDown(group.tier as TierCode);
    await user.save();
  }

  group.status = "closed";
  await group.save();
}

export async function closeExpiredGroups() {
  await connectToDatabase();
  const expiredGroups = await WeeklyLeagueGroupModel.find({
    status: "active",
    closesAt: { $lte: new Date() },
  });
  for (const group of expiredGroups) {
    await closeGroup(group);
  }
}

const MAX_GROUP_SIZE = 24;

export async function getOrCreateActiveMembership(userId: Types.ObjectId | string) {
  await connectToDatabase();
  await closeExpiredGroups();

  const user = await UserModel.findById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  const { weekKey, weekEnd } = getWeekBounds();
  const tier = (user.currentTier ?? "D") as TierCode;

  const groups = await WeeklyLeagueGroupModel.find({ weekKey, tier, status: "active" });

  let group = null as InstanceType<typeof WeeklyLeagueGroupModel> | null;
  let membership = null as InstanceType<typeof LeagueMembershipModel> | null;

  if (groups.length > 0) {
    membership = await LeagueMembershipModel.findOne({
      groupId: { $in: groups.map((g) => g._id) },
      userId: user._id,
    });
    if (membership) {
      group = groups.find((g) => String(g._id) === String(membership!.groupId)) ?? null;
    }
  }

  if (!membership) {
    for (const g of groups) {
      const count = await LeagueMembershipModel.countDocuments({ groupId: g._id });
      if (count < MAX_GROUP_SIZE) {
        group = g;
        break;
      }
    }
    if (!group) {
      group = await WeeklyLeagueGroupModel.create({ weekKey, tier, closesAt: weekEnd, status: "active" });
    }
    membership = await LeagueMembershipModel.create({ groupId: group._id, userId: user._id, points: 0, result: null });
  }

  return { group: group!, membership, user };
}
