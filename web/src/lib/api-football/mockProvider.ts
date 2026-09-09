import type { ApiFixture } from "./types";
import type { FixtureProvider } from "./provider";
import seedFixtures from "./data/liga-profesional-fechas-1-3.json";

// Partidos reales de Liga Profesional Argentina (fechas 1-3 de la temporada 2024, sacados
// de API-Football en modo live) reutilizados como datos de prueba: mismos equipos y misma
// separación entre fechas, pero con las fechas corridas al futuro para poder cargar
// pronósticos antes del kickoff. externalId, homeTeam.id, awayTeam.id SÍ son ids reales de
// API-Football, así que al pasar a API_FOOTBALL_MODE=live no hace falta remapear nada de eso.
const MOCK_LEAGUE_ID = 999;
const MOCK_SEASON = 2026;

type SeedFixture = {
  externalId: number;
  date: string;
  round: string;
  homeTeam: { id: number; name: string; logo: string };
  awayTeam: { id: number; name: string; logo: string };
};

const seed = seedFixtures as SeedFixture[];

const mockFixtures = new Map<number, ApiFixture>();

function seedIfNeeded() {
  if (mockFixtures.size > 0) return;

  const firstKickoff = new Date(seed[0].date).getTime();
  const targetFirstKickoff = Date.now() + 1000 * 60 * 60 * 24 * 2; // fecha 1 arranca en 2 días
  const shiftMs = targetFirstKickoff - firstKickoff;

  for (const item of seed) {
    const fixture: ApiFixture = {
      fixture: {
        id: item.externalId,
        date: new Date(new Date(item.date).getTime() + shiftMs).toISOString(),
        status: { short: "NS" },
      },
      league: {
        id: MOCK_LEAGUE_ID,
        name: "Liga Profesional Argentina (mock)",
        season: MOCK_SEASON,
        round: item.round,
        logo: "",
      },
      teams: {
        home: { id: item.homeTeam.id, name: item.homeTeam.name, logo: item.homeTeam.logo },
        away: { id: item.awayTeam.id, name: item.awayTeam.name, logo: item.awayTeam.logo },
      },
      goals: { home: null, away: null },
    };
    mockFixtures.set(fixture.fixture.id, fixture);
  }
}

export function setMockResult(fixtureExternalId: number, homeScore: number, awayScore: number) {
  seedIfNeeded();
  const fixture = mockFixtures.get(fixtureExternalId);
  if (!fixture) {
    throw new Error(`Fixture mock ${fixtureExternalId} no existe`);
  }
  fixture.fixture.status.short = "FT";
  fixture.goals.home = homeScore;
  fixture.goals.away = awayScore;
}

export function postponeMockFixture(fixtureExternalId: number) {
  seedIfNeeded();
  const fixture = mockFixtures.get(fixtureExternalId);
  if (!fixture) {
    throw new Error(`Fixture mock ${fixtureExternalId} no existe`);
  }
  fixture.fixture.status.short = "PST";
}

export function resetMockFixture(fixtureExternalId: number) {
  seedIfNeeded();
  const fixture = mockFixtures.get(fixtureExternalId);
  if (!fixture) {
    throw new Error(`Fixture mock ${fixtureExternalId} no existe`);
  }
  fixture.fixture.status.short = "NS";
  fixture.fixture.date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString();
  fixture.goals.home = null;
  fixture.goals.away = null;
}

export const mockFixtureProvider: FixtureProvider = {
  async getFixtures(seed) {
    seedIfNeeded();
    return [...mockFixtures.values()].filter(
      (fixture) => fixture.league.id === seed.externalId && fixture.league.season === seed.season
    );
  },
};
