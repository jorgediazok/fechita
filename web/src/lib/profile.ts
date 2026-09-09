import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import { TIER_ORDER, type TierCode } from "./tiers";
import PredictionModel from "@/models/Prediction";
import LeagueMembershipModel from "@/models/LeagueMembership";
import "@/models/RoundLeagueGroup"; // registra el schema para poder popular groupId
import { currentRoundStreak } from "./badges/award";
import type { User } from "@/models/User";

// "Tu techo": la categoría más alta que el usuario alcanzó. Toma el máximo entre el campo
// persistido y la categoría actual, por si `bestTier` quedó atrás (usuarios previos al
// campo, o datos migrados).
export function bestTierOf(user: Pick<User, "currentTier" | "bestTier">): TierCode {
  const cur = TIER_ORDER.indexOf((user.currentTier ?? "D") as TierCode);
  const best = TIER_ORDER.indexOf((user.bestTier ?? "D") as TierCode);
  return TIER_ORDER[Math.max(cur, best, 0)];
}

export type CareerStats = {
  totalPoints: number;
  hits: number;
  hitRate: number; // 0..100
  exact: number;
  roundsPlayed: number;
  roundsWon: number;
  // Fechas cerradas consecutivas (más recientes) en las que acertó +50% de sus
  // pronósticos — la misma "racha" que alimenta las insignias de fuego.
  currentStreak: number;
};

// Números de carrera para la pantalla de perfil. Todo sale de Prediction y
// LeagueMembership — sin modelo nuevo.
export async function getCareerStats(userId: Types.ObjectId | string): Promise<CareerStats> {
  await connectToDatabase();
  const uid = new Types.ObjectId(String(userId));

  const [agg] = await PredictionModel.aggregate<{
    totalPoints: number;
    graded: number;
    hits: number;
    exact: number;
  }>([
    { $match: { userId: uid, points: { $ne: null } } },
    {
      $group: {
        _id: null,
        totalPoints: { $sum: "$points" },
        graded: { $sum: 1 },
        hits: { $sum: { $cond: [{ $gte: ["$points", 3] }, 1, 0] } },
        exact: { $sum: { $cond: [{ $eq: ["$points", 5] }, 1, 0] } },
      },
    },
  ]);

  const [roundsPlayed, roundsWon, currentStreak] = await Promise.all([
    LeagueMembershipModel.countDocuments({ userId: uid, result: { $ne: null } }),
    LeagueMembershipModel.countDocuments({ userId: uid, wonRound: true }),
    currentRoundStreak(uid),
  ]);

  const graded = agg?.graded ?? 0;
  const hits = agg?.hits ?? 0;

  return {
    totalPoints: agg?.totalPoints ?? 0,
    hits,
    hitRate: graded > 0 ? Math.round((hits / graded) * 100) : 0,
    exact: agg?.exact ?? 0,
    roundsPlayed,
    roundsWon,
    currentStreak,
  };
}

export type PendingStreak = { streak: number; isMilestone: boolean };

// Racha recién crecida y todavía no festejada — para el overlay de /pronosticos. Compara el
// snapshot de la última fecha cerrada con el de la anterior; solo festeja si subió y llegó
// al menos a 2. Los hitos 3/5/8 ya los festeja la insignia de fuego, se marca `isMilestone`.
export async function getPendingStreak(
  userId: Types.ObjectId | string
): Promise<PendingStreak | null> {
  await connectToDatabase();
  const uid = new Types.ObjectId(String(userId));

  const recent = await LeagueMembershipModel.find({
    userId: uid,
    result: { $ne: null },
    streakAfter: { $ne: null },
  })
    .sort({ createdAt: -1 })
    .limit(2);

  if (recent.length === 0 || recent[0].streakSeen) return null;

  const now = recent[0].streakAfter ?? 0;
  const before = recent[1]?.streakAfter ?? 0;
  if (now < 2 || now <= before) return null;

  return { streak: now, isMilestone: [3, 5, 8].includes(now) };
}

export async function markStreakSeen(userId: Types.ObjectId | string): Promise<void> {
  await connectToDatabase();
  await LeagueMembershipModel.updateMany(
    { userId, streakSeen: { $ne: true } },
    { streakSeen: true }
  );
}

export type RoundHistoryEntry = {
  roundKey: string;
  tier: TierCode;
  rank: number;
  total: number;
  points: number;
  result: "promoted" | "relegated" | "stayed";
  wonRound: boolean;
};

// Historial de fechas cerradas del usuario, más reciente primero — para la tira de
// "HISTORIAL" en el perfil. El puesto se calcula al vuelo contra los otros del grupo
// (el snapshot de LeagueMembership guarda los puntos finales pero no la posición).
export async function getRoundHistory(
  userId: Types.ObjectId | string,
  limit = 8
): Promise<RoundHistoryEntry[]> {
  await connectToDatabase();
  const uid = new Types.ObjectId(String(userId));

  const memberships = await LeagueMembershipModel.find({ userId: uid, result: { $ne: null } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("groupId", "roundKey tier");

  return Promise.all(
    memberships.map(async (m) => {
      const group = m.groupId as unknown as { _id: Types.ObjectId; roundKey: string; tier: string };
      const [total, better] = await Promise.all([
        LeagueMembershipModel.countDocuments({ groupId: group._id }),
        LeagueMembershipModel.countDocuments({ groupId: group._id, points: { $gt: m.points } }),
      ]);
      return {
        roundKey: group.roundKey,
        tier: group.tier as TierCode,
        rank: better + 1,
        total,
        points: m.points,
        result: m.result as "promoted" | "relegated" | "stayed",
        wonRound: m.wonRound,
      };
    })
  );
}
