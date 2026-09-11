import { cache } from "react";
import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import RoundLeagueGroupModel from "@/models/RoundLeagueGroup";
import LeagueMembershipModel from "@/models/LeagueMembership";
import UserModel from "@/models/User";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import TriviaAnswerModel from "@/models/TriviaAnswer";
import { evaluateBadgesForUsers, currentRoundStreak } from "./badges/award";
import { sendToUser } from "./push/send";
import { roundCloseMessage } from "./push/messages";
import { zoneSize } from "./leagueZones";
import { triviaDayKey, TRIVIA_ROUND_CAP } from "./trivia";
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

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_GROUP_SIZE = 24;

// ─────────────────────────────────────────────────────────────────────────────
// Fechas del campeonato (derivadas de los partidos, campo Match.round)
// ─────────────────────────────────────────────────────────────────────────────

type RoundInfo = { roundKey: string; first: Date; last: Date; total: number; done: number };

// El aggregate sobre todos los partidos se repite 2-3 veces por render (closeExpiredGroups,
// getCurrentRoundKey, getRoundProgress). cache() lo colapsa a una sola corrida por request.
const getRoundsInOrder = cache(async function getRoundsInOrder(): Promise<RoundInfo[]> {
  const rows = await MatchModel.aggregate<{
    _id: string;
    first: Date;
    last: Date;
    total: number;
    done: number;
  }>([
    {
      $group: {
        _id: "$round",
        first: { $min: "$kickoffAt" },
        last: { $max: "$kickoffAt" },
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $in: ["$status", ["finished", "cancelled"]] }, 1, 0] } },
      },
    },
    { $sort: { first: 1 } },
  ]);
  return rows.map((r) => ({ roundKey: r._id, first: r.first, last: r.last, total: r.total, done: r.done }));
});

// La fecha "actual" para inscribir: la primera (por kickoff) que todavía tiene partidos por
// jugar y no tiene un grupo cerrado. Una fecha ya terminada nunca es "la actual" (si no,
// arrancar la liga hoy inscribiría a todos en una fecha vieja y la cerraría con 0 puntos).
// Si todas las fechas terminaron, se usa la última no cerrada.
export async function getCurrentRoundKey(): Promise<string | null> {
  await connectToDatabase();
  const rounds = await getRoundsInOrder();
  if (rounds.length === 0) return null;

  const closed = new Set(
    (await RoundLeagueGroupModel.find({ status: "closed" }, { roundKey: 1 })).map((g) => g.roundKey)
  );
  const open = rounds.filter((r) => !closed.has(r.roundKey));
  if (open.length === 0) return rounds[rounds.length - 1].roundKey;

  const pending = open.find((r) => r.done < r.total);
  return (pending ?? open[open.length - 1]).roundKey;
}

export async function getRoundBounds(roundKey: string) {
  const agg = await MatchModel.aggregate<{ first: Date; last: Date }>([
    { $match: { round: roundKey } },
    { $group: { _id: null, first: { $min: "$kickoffAt" }, last: { $max: "$kickoffAt" } } },
  ]);
  return agg.length ? { first: agg[0].first, last: agg[0].last } : null;
}

export async function getRoundProgress(roundKey: string) {
  const rounds = await getRoundsInOrder();
  const info = rounds.find((r) => r.roundKey === roundKey);
  if (!info) return { total: 0, done: 0, complete: false };
  return { total: info.total, done: info.done, complete: info.total > 0 && info.done === info.total };
}

// ─────────────────────────────────────────────────────────────────────────────
// Standing en vivo
// ─────────────────────────────────────────────────────────────────────────────

export { zoneSize };

async function getLivePoints(userIds: Types.ObjectId[], roundKey: string) {
  if (userIds.length === 0) return new Map<string, number>();

  const rows = await PredictionModel.aggregate<{ _id: Types.ObjectId; total: number }>([
    { $match: { userId: { $in: userIds }, points: { $ne: null } } },
    { $lookup: { from: "matches", localField: "matchId", foreignField: "_id", as: "match" } },
    { $unwind: "$match" },
    { $match: { "match.round": roundKey } },
    { $group: { _id: "$userId", total: { $sum: "$points" } } },
  ]);

  return new Map(rows.map((r) => [String(r._id), r.total]));
}

// Cuánto suma la trivia diaria a esta fecha puntual: aciertos de trivia con `dayKey` dentro
// de la ventana de la fecha (desde el primer kickoff hasta el último + 1 día, el mismo
// margen que usa `closesAt` para un partido postergado), tope TRIVIA_ROUND_CAP por usuario.
// El resto de los aciertos igual cuentan para las insignias (lib/trivia#totalTriviaHits),
// pero no siguen empujando el ascenso — ver docs/product-design.md.
async function getTriviaRoundBonus(userIds: Types.ObjectId[], roundKey: string) {
  if (userIds.length === 0) return new Map<string, number>();

  const bounds = await getRoundBounds(roundKey);
  if (!bounds) return new Map<string, number>();

  const fromDay = triviaDayKey(bounds.first);
  const toDay = triviaDayKey(new Date(bounds.last.getTime() + DAY_MS));

  const rows = await TriviaAnswerModel.aggregate<{ _id: Types.ObjectId; n: number }>([
    {
      $match: {
        userId: { $in: userIds },
        correct: true,
        dayKey: { $gte: fromDay, $lte: toDay },
      },
    },
    { $group: { _id: "$userId", n: { $sum: 1 } } },
  ]);

  return new Map(rows.map((r) => [String(r._id), Math.min(r.n, TRIVIA_ROUND_CAP)]));
}

async function standingFor(groupId: Types.ObjectId, roundKey: string) {
  const memberships = await LeagueMembershipModel.find({ groupId });
  const userIds = memberships.map((m) => m.userId);
  const [pointsMap, triviaMap] = await Promise.all([
    getLivePoints(userIds, roundKey),
    getTriviaRoundBonus(userIds, roundKey),
  ]);
  return memberships
    .map((m) => ({
      membership: m,
      points: (pointsMap.get(String(m.userId)) ?? 0) + (triviaMap.get(String(m.userId)) ?? 0),
    }))
    .sort((a, b) => b.points - a.points);
}

export async function getGroupStanding(groupId: Types.ObjectId | string) {
  const group = await RoundLeagueGroupModel.findById(groupId);
  if (!group) return [];
  return standingFor(group._id, group.roundKey);
}

// ─────────────────────────────────────────────────────────────────────────────
// Cierre de fecha: ascenso / descenso / ganador de la fecha
// ─────────────────────────────────────────────────────────────────────────────

async function closeGroup(group: InstanceType<typeof RoundLeagueGroupModel>) {
  const ranked = await standingFor(group._id, group.roundKey);
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

    const user = await UserModel.findById(membership.userId);

    membership.points = points;
    membership.result = result;
    membership.wonRound = i === 0 && ranked.length > 1;
    // Racha ya con esta fecha contada, para festejar si creció (solo usuarios reales).
    membership.streakAfter =
      user && !user.isBot ? await currentRoundStreak(membership.userId) : null;
    await membership.save();

    if (!user) continue;
    if (result === "promoted") {
      const up = nextTierUp(group.tier as TierCode);
      user.currentTier = up;
      if (TIER_ORDER.indexOf(up) > TIER_ORDER.indexOf((user.bestTier ?? "D") as TierCode)) {
        user.bestTier = up;
      }
    } else if (result === "relegated") {
      user.currentTier = nextTierDown(group.tier as TierCode);
    }
    await user.save();

    // T4 — push de cierre de fecha (ascenso / descenso / ganador). Solo usuarios reales;
    // dedupeKey = groupId → una sola vez por grupo cerrado. roundCloseMessage devuelve null
    // para "stayed" sin corona, y sendToUser nunca lanza.
    if (!user.isBot) {
      const msg = roundCloseMessage({
        result,
        wonRound: Boolean(membership.wonRound),
        roundKey: group.roundKey,
        newTier: (user.currentTier ?? "D") as TierCode,
      });
      if (msg) {
        await sendToUser(String(user._id), msg, {
          kind: "round-close",
          dedupeKey: String(group._id),
        });
      }
    }
  }

  group.status = "closed";
  await group.save();
}

export async function closeExpiredGroups() {
  await connectToDatabase();
  const active = await RoundLeagueGroupModel.find({ status: "active" });
  if (active.length === 0) return;

  const rounds = new Map((await getRoundsInOrder()).map((r) => [r.roundKey, r]));
  const now = Date.now();
  const affected = new Set<string>();

  for (const group of active) {
    const info = rounds.get(group.roundKey);
    const allDone = info ? info.total > 0 && info.done === info.total : false;
    const pastDeadline = group.closesAt.getTime() <= now;
    if (!allDone && !pastDeadline) continue;

    const members = await LeagueMembershipModel.find({ groupId: group._id }, { userId: 1 });
    for (const m of members) affected.add(String(m.userId));
    await closeGroup(group);
  }

  // Reinscribir enseguida a todos los que estaban en un grupo cerrado (con su tier ya
  // actualizado) — sin esto, dos que ascienden juntos no se cruzan hasta que ambos recargan.
  for (const userId of affected) {
    await enrollUserForCurrentRound(userId);
  }

  // Insignias de ascenso y "ganador de la fecha" — recién acá quedan firmes el tier nuevo
  // y el LeagueMembership.wonRound. Tolerante a fallos, bots filtrados adentro.
  if (affected.size > 0) {
    await evaluateBadgesForUsers([...affected]);
  }
}

// Anuncio de ascenso/descenso pendiente de ver (una sola vez por resultado). "stayed" no
// genera anuncio, solo promoted/relegated.
export async function getPendingLeagueResult(userId: Types.ObjectId | string) {
  const membership = await LeagueMembershipModel.findOne({
    userId,
    result: { $in: ["promoted", "relegated"] },
    resultAcknowledged: { $ne: true },
  }).sort({ createdAt: -1 });
  if (!membership) return null;

  const group = await RoundLeagueGroupModel.findById(membership.groupId);
  if (!group) return null;

  const finalMemberships = await LeagueMembershipModel.find({ groupId: group._id }).sort({ points: -1 });
  const standings = await Promise.all(
    finalMemberships.map(async (m) => {
      const memberUser = await UserModel.findById(m.userId).populate("favoriteTeamId", "name shortName logoUrl");
      return {
        userId: String(m.userId),
        name: memberUser?.name ?? "?",
        isBot: memberUser?.isBot ?? false,
        points: m.points,
        result: m.result as "promoted" | "relegated" | "stayed" | null,
        team: (memberUser?.favoriteTeamId ?? null) as { name: string; shortName: string; logoUrl: string } | null,
      };
    })
  );

  return {
    membershipId: String(membership._id),
    result: membership.result as "promoted" | "relegated",
    oldTier: group.tier as TierCode,
    roundKey: group.roundKey,
    points: membership.points,
    standings,
  };
}

export async function acknowledgeLeagueResult(membershipId: Types.ObjectId | string) {
  await connectToDatabase();
  await LeagueMembershipModel.findByIdAndUpdate(membershipId, { resultAcknowledged: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Inscripción
// ─────────────────────────────────────────────────────────────────────────────

// Encuentra (o crea) el grupo de la fecha actual para el tier del usuario y le garantiza una
// membresía. No cierra fechas vencidas — de eso se encarga closeExpiredGroups, que llama acá.
export async function enrollUserForCurrentRound(userId: Types.ObjectId | string) {
  await connectToDatabase();

  const user = await UserModel.findById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  const tier = (user.currentTier ?? "D") as TierCode;

  // Camino rápido (el 99% de las visitas): si ya estás en un grupo activo de tu categoría, ese
  // es el de la fecha actual — closeExpiredGroups ya reinscribió cualquier membresía vencida.
  // Evita el aggregate de getCurrentRoundKey en cada carga de /liga y /pronosticos.
  const activeGroups = await RoundLeagueGroupModel.find({ tier, status: "active" });
  if (activeGroups.length) {
    const current = await LeagueMembershipModel.findOne({
      groupId: { $in: activeGroups.map((g) => g._id) },
      userId: user._id,
    });
    if (current) {
      const g = activeGroups.find((x) => String(x._id) === String(current.groupId))!;
      return { group: g, membership: current, user };
    }
  }

  // Camino completo: no estás inscripto (usuario nuevo o recién ascendido/descendido).
  const roundKey = await getCurrentRoundKey();
  if (!roundKey) throw new Error("No hay fechas cargadas todavía — sincronizá partidos");

  const groups = activeGroups.filter((g) => g.roundKey === roundKey);

  let group: InstanceType<typeof RoundLeagueGroupModel> | null = null;
  for (const g of groups) {
    if ((await LeagueMembershipModel.countDocuments({ groupId: g._id })) < MAX_GROUP_SIZE) {
      group = g;
      break;
    }
  }
  if (!group) {
    const bounds = await getRoundBounds(roundKey);
    const lastMs = bounds?.last.getTime() ?? Date.now() + 3 * DAY_MS;
    group = await RoundLeagueGroupModel.create({
      roundKey,
      tier,
      closesAt: new Date(lastMs + DAY_MS),
      status: "active",
    });
  }
  const membership = await LeagueMembershipModel.create({
    groupId: group._id,
    userId: user._id,
    points: 0,
    result: null,
  });

  return { group, membership, user };
}

export async function getOrCreateActiveMembership(userId: Types.ObjectId | string) {
  await connectToDatabase();
  await closeExpiredGroups();
  return enrollUserForCurrentRound(userId);
}
