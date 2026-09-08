import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import TeamModel from "@/models/Team";
import PredictionModel from "@/models/Prediction";
import UserModel from "@/models/User";
import { teamStrength } from "./teamStrength";
import { predictMatch } from "./strategy";

// Los bots pronostican los partidos programados que arrancan dentro de esta ventana.
// Alcanza con que cubra la fecha en juego y la siguiente.
const PREDICT_WINDOW_DAYS = 12;
const DEFAULT_SKILL = 0.6;

export type RunBotsResult = { bots: number; predictionsCreated: number };

// Idempotente: crea solo los pronósticos que faltan (nunca pisa uno existente) y, por el
// RNG determinístico de strategy.ts, un partido dado siempre da la misma jugada para el
// mismo bot. Se dispara después de cada sync (cron y botón dev).
export async function runBots(): Promise<RunBotsResult> {
  await connectToDatabase();

  const bots = await UserModel.find({ isBot: true }, { _id: 1, botSkill: 1 });
  if (bots.length === 0) return { bots: 0, predictionsCreated: 0 };

  const now = Date.now();
  const matches = await MatchModel.find(
    {
      status: "scheduled",
      kickoffAt: { $gt: new Date(now), $lte: new Date(now + PREDICT_WINDOW_DAYS * 86_400_000) },
    },
    { _id: 1, homeTeamId: 1, awayTeamId: 1 }
  );
  if (matches.length === 0) return { bots: bots.length, predictionsCreated: 0 };

  const teamIds = [...new Set(matches.flatMap((m) => [String(m.homeTeamId), String(m.awayTeamId)]))];
  const teams = await TeamModel.find({ _id: { $in: teamIds } }, { externalId: 1 });
  const externalIdByTeam = new Map(teams.map((t) => [String(t._id), t.externalId as number]));

  const existing = await PredictionModel.find(
    { userId: { $in: bots.map((b) => b._id) }, matchId: { $in: matches.map((m) => m._id) } },
    { userId: 1, matchId: 1 }
  );
  const alreadyDone = new Set(existing.map((p) => `${p.userId}:${p.matchId}`));

  const docs: Record<string, unknown>[] = [];
  for (const bot of bots) {
    const skill = typeof bot.botSkill === "number" ? bot.botSkill : DEFAULT_SKILL;
    for (const match of matches) {
      if (alreadyDone.has(`${bot._id}:${match._id}`)) continue;
      const pred = predictMatch({
        homeStrength: teamStrength(externalIdByTeam.get(String(match.homeTeamId))),
        awayStrength: teamStrength(externalIdByTeam.get(String(match.awayTeamId))),
        skill,
        seed: `${bot._id}:${match._id}`,
      });
      docs.push({
        userId: bot._id,
        matchId: match._id,
        predictedDirection: pred.direction,
        predictedHomeScore: pred.homeScore,
        predictedAwayScore: pred.awayScore,
      });
    }
  }

  if (docs.length) {
    // ordered:false → si otra corrida en paralelo ya insertó alguno, el índice único
    // {userId, matchId} lo rechaza y el resto sigue.
    await PredictionModel.insertMany(docs, { ordered: false }).catch((err) => {
      if (err?.code !== 11000) throw err;
    });
  }

  return { bots: bots.length, predictionsCreated: docs.length };
}
