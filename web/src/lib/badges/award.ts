import { Types } from "mongoose";
import { connectToDatabase } from "../db";
import { TIER_ORDER, type TierCode } from "../tiers";
import { BADGES, BADGE_IDS, META_BADGE_ID, NON_META_BADGE_IDS } from "./catalog";
import UserModel from "@/models/User";
import PredictionModel from "@/models/Prediction";
import MatchModel from "@/models/Match";
import TeamModel from "@/models/Team";
import LeagueMembershipModel from "@/models/LeagueMembership";
import UserBadgeModel from "@/models/UserBadge";
import { sendToUser } from "../push/send";
import { badgeMessage } from "../push/messages";

// Un "acierto" es un pronóstico que sumó al menos 3 puntos (dirección correcta). El punto
// flat de 1 por partido anulado no cuenta.
const HIT = { $gte: 3 } as const;

function oid(userId: Types.ObjectId | string) {
  return new Types.ObjectId(String(userId));
}

// ── criterios que necesitan agregación ───────────────────────────────────────

// Racha: fechas del campeonato terminadas (todos sus partidos jugados), en orden
// cronológico, contadas hacia atrás desde la última mientras el usuario le haya acertado a
// MÁS DE LA MITAD de sus pronósticos de esa fecha. Una fecha con 50% o menos — o con menos
// de 3 pronósticos cargados (no la jugó en serio) — corta la racha.
const STREAK_MIN_PREDICTIONS = 3;

export async function currentRoundStreak(userId: Types.ObjectId | string): Promise<number> {
  const rounds = await MatchModel.aggregate<{
    _id: string;
    total: number;
    finished: number;
    first: Date;
  }>([
    {
      $group: {
        _id: "$round",
        total: { $sum: 1 },
        finished: { $sum: { $cond: [{ $in: ["$status", ["finished", "cancelled"]] }, 1, 0] } },
        first: { $min: "$kickoffAt" },
      },
    },
    { $sort: { first: 1 } },
  ]);
  const finishedRounds = rounds.filter((r) => r.total > 0 && r.finished === r.total).map((r) => r._id);
  if (finishedRounds.length === 0) return 0;

  const perRound = await PredictionModel.aggregate<{ _id: string; total: number; hits: number }>([
    { $match: { userId: oid(userId), points: { $ne: null } } },
    { $lookup: { from: "matches", localField: "matchId", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    {
      $group: {
        _id: "$m.round",
        total: { $sum: 1 },
        hits: { $sum: { $cond: [{ $gte: ["$points", 3] }, 1, 0] } },
      },
    },
  ]);
  const statsByRound = new Map(perRound.map((r) => [r._id, r]));

  let streak = 0;
  for (let i = finishedRounds.length - 1; i >= 0; i--) {
    const s = statsByRound.get(finishedRounds[i]);
    if (s && s.total >= STREAK_MIN_PREDICTIONS && s.hits > s.total / 2) streak++;
    else break;
  }
  return streak;
}

function isSuperclasico(a: string, b: string) {
  const names = [a, b].map((n) => n.toLowerCase());
  return names.some((n) => n.includes("river plate")) && names.some((n) => n.includes("boca juniors"));
}

async function wonASuperclasico(userId: Types.ObjectId | string): Promise<boolean> {
  const clasicoTeams = await TeamModel.find(
    { name: { $in: [/river plate/i, /boca juniors/i] } },
    { _id: 1, name: 1 }
  );
  if (clasicoTeams.length < 2) return false;
  const ids = new Set(clasicoTeams.map((t) => String(t._id)));

  const clasicos = await MatchModel.find(
    { status: "finished", homeTeamId: { $in: [...ids].map(oid) }, awayTeamId: { $in: [...ids].map(oid) } },
    { _id: 1, homeTeamId: 1, awayTeamId: 1 }
  ).populate<{ homeTeamId: { name: string }; awayTeamId: { name: string } }>("homeTeamId awayTeamId", "name");

  const matchIds = clasicos
    .filter((m) => isSuperclasico(m.homeTeamId.name, m.awayTeamId.name))
    .map((m) => m._id);
  if (matchIds.length === 0) return false;

  return Boolean(await PredictionModel.exists({ userId: oid(userId), matchId: { $in: matchIds }, points: HIT }));
}

// Sorpresa: acertaste un partido terminado en el que, entre todos los pronósticos de la app
// (con muestra suficiente), el 70% o más erró la dirección.
async function calledASurprise(userId: Types.ObjectId | string): Promise<boolean> {
  const wins = await PredictionModel.find({ userId: oid(userId), points: HIT }, { matchId: 1 });
  if (wins.length === 0) return false;

  const rows = await PredictionModel.aggregate<{ _id: Types.ObjectId; total: number; hits: number }>([
    { $match: { matchId: { $in: wins.map((w) => w.matchId) }, points: { $ne: null } } },
    {
      $group: {
        _id: "$matchId",
        total: { $sum: 1 },
        hits: { $sum: { $cond: [{ $gte: ["$points", 3] }, 1, 0] } },
      },
    },
  ]);
  return rows.some((r) => r.total >= 8 && r.hits / r.total <= 0.3);
}

// ── evaluación ───────────────────────────────────────────────────────────────

// Revisa todos los criterios que al usuario todavía le faltan y persiste las insignias
// nuevas (idempotente — el índice único userId+badgeId evita duplicados en carreras). No
// evalúa bots. Devuelve los ids de las insignias recién ganadas, para el festejo.
export async function evaluateBadgesForUser(userId: Types.ObjectId | string): Promise<string[]> {
  await connectToDatabase();

  const user = await UserModel.findById(userId);
  if (!user || user.isBot) return [];

  const earned = new Set(
    (await UserBadgeModel.find({ userId: user._id }, { badgeId: 1 })).map((d) => d.badgeId)
  );
  if (earned.size >= BADGE_IDS.length) return [];

  const pending = BADGES.filter((b) => !earned.has(b.id));
  const has = (group: string) => pending.some((b) => b.group === group);
  const newly: string[] = [];

  if (has("aciertos")) {
    const count = await PredictionModel.countDocuments({ userId: user._id, points: HIT });
    for (const [id, threshold] of [
      ["debut", 10],
      ["pulso", 50],
      ["ojo", 100],
      ["fenomeno", 500],
    ] as const) {
      if (!earned.has(id) && count >= threshold) newly.push(id);
    }
  }

  if (has("rachas")) {
    const streak = await currentRoundStreak(user._id);
    for (const [id, n] of [
      ["enracha", 3],
      ["imparable", 5],
      ["elegido", 8],
    ] as const) {
      if (!earned.has(id) && streak >= n) newly.push(id);
    }
  }

  if (has("exactos")) {
    const exacts = await PredictionModel.countDocuments({ userId: user._id, points: 5 });
    for (const [id, n] of [
      ["cinco", 1],
      ["adivino", 10],
      ["brujo", 25],
    ] as const) {
      if (!earned.has(id) && exacts >= n) newly.push(id);
    }
  }

  if (has("ascensos")) {
    const tierIdx = TIER_ORDER.indexOf((user.currentTier ?? "D") as TierCode);
    for (const [id, tier] of [
      ["sub-c", "C"],
      ["sub-b", "B"],
      ["sub-n", "NACIONAL"],
      ["sub-1", "PRIMERA"],
    ] as const) {
      if (!earned.has(id) && tierIdx >= TIER_ORDER.indexOf(tier)) newly.push(id);
    }
  }

  if (!earned.has("ganador") && (await LeagueMembershipModel.exists({ userId: user._id, wonRound: true }))) {
    newly.push("ganador");
  }
  if (!earned.has("superclasico") && (await wonASuperclasico(user._id))) {
    newly.push("superclasico");
  }
  if (!earned.has("sorpresa") && (await calledASurprise(user._id))) {
    newly.push("sorpresa");
  }

  // Colección completa — última, cuenta también lo recién ganado en esta corrida.
  if (!earned.has(META_BADGE_ID)) {
    const owned = new Set([...earned, ...newly]);
    if (NON_META_BADGE_IDS.every((id) => owned.has(id))) newly.push(META_BADGE_ID);
  }

  for (const badgeId of newly) {
    await UserBadgeModel.updateOne(
      { userId: user._id, badgeId },
      { $setOnInsert: { userId: user._id, badgeId, earnedAt: new Date(), seen: false } },
      { upsert: true }
    );
  }

  // T3 — push por cada insignia nueva. dedupeKey = badgeId → una sola vez por insignia,
  // sin importar por qué camino se detectó (sync, cierre de fecha, o carga de /pronosticos).
  for (const badgeId of newly) {
    await sendToUser(String(user._id), badgeMessage(badgeId), {
      kind: "badge",
      dedupeKey: badgeId,
    });
  }

  return newly;
}

// Batch, tolerante a fallos — pensado para llamar desde el sync y el cierre de fecha sin
// riesgo de romper esos flujos si un criterio tira error.
export async function evaluateBadgesForUsers(userIds: (Types.ObjectId | string)[]): Promise<void> {
  for (const userId of userIds) {
    try {
      await evaluateBadgesForUser(userId);
    } catch (err) {
      console.error(`[badges] evaluación falló para ${String(userId)}:`, err);
    }
  }
}
