/**
 * Baja una temporada real completa de API-Football (free tier) a un JSON, para usarla en
 * modo replay (FIXTURE_SOURCE=replay) — ver src/lib/api-football/replayProvider.ts.
 *
 *   npm run fetch-season                  → Liga Profesional 2024 (default)
 *   npm run fetch-season -- 128 2023      → otra liga / temporada
 *
 * El free tier de API-Football solo da temporadas 2022-2024. Los datos salen ya "jugados"
 * (todos FT con resultado real); el provider de replay se encarga de correrlos al presente
 * y de ocultar el resultado hasta que pase el kickoff simulado.
 *
 * Necesita API_FOOTBALL_KEY en .env.local.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { ApiFixture } from "@/lib/api-football/types";

const BASE_URL = "https://v3.football.api-sports.io";

const leagueId = Number(process.argv[2] ?? 128);
const season = Number(process.argv[3] ?? 2024);
const outFile = process.argv[4]
  ? path.resolve(process.argv[4])
  : path.resolve(import.meta.dirname, "../src/lib/api-football/data/liga-profesional-2024.json");

// "2nd Phase - 7", "Regular Season - 7", etc. → "Fecha 7"
function prettyRound(round: string): string {
  const n = round.match(/(\d+)\s*$/);
  return n ? `Fecha ${n[1]}` : round;
}

async function main() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) throw new Error("Falta API_FOOTBALL_KEY en .env.local");

  const res = await fetch(`${BASE_URL}/fixtures?league=${leagueId}&season=${season}`, {
    headers: { "x-apisports-key": apiKey },
  });
  if (!res.ok) throw new Error(`API-Football respondió ${res.status}`);

  const data = (await res.json()) as {
    errors: string[] | Record<string, string>;
    response: ApiFixture[];
  };
  const errors = Array.isArray(data.errors) ? data.errors : Object.values(data.errors ?? {});
  if (errors.length) throw new Error(`API-Football: ${errors.join("; ")}`);

  // Se guarda solo lo que consume el tipo ApiFixture — el resto (árbitro, venue, periods…) no.
  const trimmed: ApiFixture[] = data.response
    .map((f) => ({
      fixture: {
        id: f.fixture.id,
        date: f.fixture.date,
        status: { short: f.fixture.status.short },
      },
      league: {
        id: f.league.id,
        name: f.league.name,
        season: f.league.season,
        round: prettyRound(f.league.round),
        logo: f.league.logo,
      },
      teams: {
        home: { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo },
        away: { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo },
      },
      goals: { home: f.goals.home, away: f.goals.away },
    }))
    .sort((a, b) => a.fixture.date.localeCompare(b.fixture.date));

  await writeFile(outFile, JSON.stringify(trimmed, null, 2) + "\n");
  const rounds = new Set(trimmed.map((f) => f.league.round));
  console.log(
    `OK — ${trimmed.length} partidos, ${rounds.size} fechas (${trimmed[0]?.fixture.date.slice(0, 10)} → ${trimmed.at(-1)?.fixture.date.slice(0, 10)})\n→ ${outFile}`
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
