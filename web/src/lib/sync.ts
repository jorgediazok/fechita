import { connectToDatabase } from "./db";
import { getFixtureProvider, mapApiStatus, type ApiFixture } from "./api-football";
import { COMPETITIONS, type CompetitionSeed } from "./competitions";
import { calculatePoints } from "./points";
import CompetitionModel from "@/models/Competition";
import TeamModel from "@/models/Team";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";

async function upsertTeam(team: ApiFixture["teams"]["home"]) {
  return TeamModel.findOneAndUpdate(
    { externalId: team.id },
    {
      externalId: team.id,
      name: team.name,
      shortName: team.name,
      country: "Argentina",
      // No pisar un escudo ya guardado con vacío: algunos providers (The Odds API) no traen logo.
      ...(team.logo ? { logoUrl: team.logo } : {}),
    },
    { upsert: true, returnDocument: "after" }
  );
}

export type SyncResult = {
  competition: string;
  matchesUpserted: number;
  predictionsScored: number;
};

export async function syncCompetition(seed: CompetitionSeed): Promise<SyncResult> {
  await connectToDatabase();

  const competition = await CompetitionModel.findOneAndUpdate(
    { externalId: seed.externalId, season: seed.season },
    { externalId: seed.externalId, name: seed.name, slug: seed.slug, season: seed.season, logoUrl: seed.logoUrl },
    { upsert: true, returnDocument: "after" }
  );

  const provider = getFixtureProvider();
  const fixtures = await provider.getFixtures(seed);

  let matchesUpserted = 0;
  let predictionsScored = 0;

  for (const fixture of fixtures) {
    const [homeTeam, awayTeam] = await Promise.all([
      upsertTeam(fixture.teams.home),
      upsertTeam(fixture.teams.away),
    ]);

    const status = mapApiStatus(fixture.fixture.status.short);

    const match = await MatchModel.findOneAndUpdate(
      { externalId: fixture.fixture.id },
      {
        externalId: fixture.fixture.id,
        competitionId: competition._id,
        round: fixture.league.round,
        homeTeamId: homeTeam._id,
        awayTeamId: awayTeam._id,
        kickoffAt: new Date(fixture.fixture.date),
        status,
        homeScore: fixture.goals.home,
        awayScore: fixture.goals.away,
        lastSyncedAt: new Date(),
      },
      { upsert: true, returnDocument: "after" }
    );
    matchesUpserted += 1;

    if (status === "finished" && match.homeScore !== null && match.awayScore !== null) {
      const pendingPredictions = await PredictionModel.find({ matchId: match._id, points: null });
      for (const prediction of pendingPredictions) {
        prediction.points = calculatePoints(
          {
            predictedDirection: prediction.predictedDirection,
            predictedHomeScore: prediction.predictedHomeScore,
            predictedAwayScore: prediction.predictedAwayScore,
          },
          { homeScore: match.homeScore, awayScore: match.awayScore }
        );
        await prediction.save();
        predictionsScored += 1;
      }
    } else if (status === "cancelled") {
      // Partido anulado del todo (no reprogramado): 1 punto flat para quien ya había pronosticado.
      const result = await PredictionModel.updateMany(
        { matchId: match._id, points: null },
        { points: 1 }
      );
      predictionsScored += result.modifiedCount;
    }
  }

  return { competition: competition.slug, matchesUpserted, predictionsScored };
}

export async function syncAllCompetitions(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const seed of COMPETITIONS) {
    results.push(await syncCompetition(seed));
  }
  return results;
}
