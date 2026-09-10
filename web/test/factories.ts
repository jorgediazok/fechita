import mongoose from "mongoose";
import CompetitionModel from "@/models/Competition";
import TeamModel from "@/models/Team";
import MatchModel from "@/models/Match";
import UserModel from "@/models/User";
import PredictionModel from "@/models/Prediction";
import type { TierCode } from "@/lib/tiers";

let n = 0;
const next = () => ++n;

export async function makeUser(overrides: Partial<{ currentTier: TierCode; isBot: boolean; name: string }> = {}) {
  const i = next();
  return UserModel.create({
    name: overrides.name ?? `User ${i}`,
    email: `u${i}@test.local`,
    favoriteTeamId: new mongoose.Types.ObjectId(),
    currentTier: overrides.currentTier ?? "D",
    isBot: overrides.isBot ?? false,
  });
}

export async function makeUsers(count: number, tier: TierCode = "D") {
  return Promise.all(Array.from({ length: count }, () => makeUser({ currentTier: tier })));
}

type MatchOpts = {
  status?: "scheduled" | "finished" | "cancelled" | "postponed" | "live";
  kickoffAt?: Date;
  homeScore?: number;
  awayScore?: number;
};

// Crea `count` partidos de una fecha. Por defecto: terminados 1-0, con kickoff en el pasado.
export async function makeRoundMatches(round: string, count: number, opts: MatchOpts = {}) {
  const status = opts.status ?? "finished";
  const finished = status === "finished";
  const comp = await CompetitionModel.create({
    externalId: next(),
    name: "Test League",
    slug: `test-${next()}`,
    season: 2026,
    logoUrl: "https://example.test/logo.png",
  });
  const teamBase = { logoUrl: "https://example.test/team.png", country: "Argentina" };
  const home = await TeamModel.create({ externalId: next(), name: "Home", shortName: "HOM", ...teamBase });
  const away = await TeamModel.create({ externalId: next(), name: "Away", shortName: "AWA", ...teamBase });

  return Promise.all(
    Array.from({ length: count }, () =>
      MatchModel.create({
        externalId: next(),
        competitionId: comp._id,
        round,
        homeTeamId: home._id,
        awayTeamId: away._id,
        kickoffAt: opts.kickoffAt ?? new Date(Date.now() - 3 * 60 * 60 * 1000),
        status,
        homeScore: opts.homeScore ?? (finished ? 1 : null),
        awayScore: opts.awayScore ?? (finished ? 0 : null),
        lastSyncedAt: new Date(),
      })
    )
  );
}

// Marca todos los partidos de una fecha como terminados (1-0).
export async function finishRound(round: string, homeScore = 1, awayScore = 0) {
  await MatchModel.updateMany(
    { round },
    { $set: { status: "finished", homeScore, awayScore, lastSyncedAt: new Date() } }
  );
}

// Le da a un usuario un total de puntos en una fecha, con una predicción por partido.
// `points` se reparte: todo en la primera, 0 en el resto (alcanza para el ranking).
export async function scoreUserInRound(
  userId: mongoose.Types.ObjectId | string,
  matches: { _id: mongoose.Types.ObjectId }[],
  totalPoints: number
) {
  await Promise.all(
    matches.map((m, i) =>
      PredictionModel.create({
        userId,
        matchId: m._id,
        predictedDirection: "home",
        points: i === 0 ? totalPoints : 0,
      })
    )
  );
}

// Crea las predicciones de un usuario en una fecha con puntos por partido. `pointsPerMatch[i]`
// = puntos de la predicción sobre matches[i]; `null` = no pronosticó ese partido.
export async function predictRound(
  userId: mongoose.Types.ObjectId | string,
  matches: { _id: mongoose.Types.ObjectId }[],
  pointsPerMatch: (number | null)[]
) {
  await Promise.all(
    matches.map((m, i) => {
      const pts = pointsPerMatch[i];
      if (pts === null || pts === undefined) return null;
      return PredictionModel.create({
        userId,
        matchId: m._id,
        predictedDirection: "home",
        points: pts,
      });
    })
  );
}
