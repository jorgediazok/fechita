import type { ApiFixture } from "./types";
import type { FixtureProvider } from "./provider";
import { connectToDatabase } from "../db";
import DevStateModel from "@/models/DevState";
import seasonData from "./data/liga-profesional-2024.json";

// Modo replay: una temporada real ya jugada (Liga Profesional 2024) corrida al presente.
// El JSON `./data/liga-profesional-2024.json` está congelado en el repo — datos, equipos e
// IDs reales, sin costo y sin llamadas a ninguna API en runtime; los resultados no cambian.
//
// - El corrimiento se ancla la primera vez que corre un sync en modo replay (DevState.
//   replayStartedAt) y no se vuelve a mover: la temporada avanza al ritmo real (~1 fecha
//   por semana), que es justo lo que necesita la liga semanal.
// - Fecha 1 arranca LEAD_MS después de esa ancla.
// - El resultado real de cada partido se oculta (status NS, goals null) hasta REVEAL_DELAY_MS
//   después del kickoff corrido — antes de eso el partido se ve como "por jugarse".
const LEAD_MS = 1000 * 60 * 60 * 24 * 2;
const REVEAL_DELAY_MS = 1000 * 60 * 60 * 2;

const fixtures = seasonData as ApiFixture[];
const REAL_FIRST_KICKOFF = Math.min(...fixtures.map((f) => new Date(f.fixture.date).getTime()));

async function getReplayAnchor(): Promise<number> {
  await connectToDatabase();
  const state = await DevStateModel.findOneAndUpdate(
    { key: "singleton" },
    { $setOnInsert: { key: "singleton" } },
    { upsert: true, returnDocument: "after" }
  );
  if (state.replayStartedAt) return new Date(state.replayStartedAt).getTime();

  const now = Date.now();
  state.replayStartedAt = new Date(now);
  await state.save();
  return now;
}

export const replayFixtureProvider: FixtureProvider = {
  async getFixtures(seed) {
    const anchor = await getReplayAnchor();
    const shiftMs = anchor + LEAD_MS - REAL_FIRST_KICKOFF;
    const now = Date.now();

    return fixtures.map((f) => {
      const shiftedMs = new Date(f.fixture.date).getTime() + shiftMs;
      const revealed = now >= shiftedMs + REVEAL_DELAY_MS;
      return {
        fixture: {
          id: f.fixture.id,
          date: new Date(shiftedMs).toISOString(),
          status: { short: revealed ? f.fixture.status.short : "NS" },
        },
        league: {
          id: seed.externalId,
          name: seed.name,
          season: seed.season,
          round: f.league.round,
          logo: f.league.logo,
        },
        teams: f.teams,
        goals: revealed ? f.goals : { home: null, away: null },
      };
    });
  },
};
