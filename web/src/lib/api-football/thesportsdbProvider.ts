import type { ApiFixture } from "./types";
import type { FixtureProvider } from "./provider";
import type { CompetitionSeed } from "../competitions";

// TheSportsDB (free tier): base de datos deportiva colaborativa. A diferencia de API-Football,
// el plan gratis sí cubre la temporada en curso. Ver docs/product-design.md.
//
// Se usan dos endpoints en vez del volcado de temporada completa (`eventsseason.php`, que
// tiene un límite duro de requests de por vida): próximos 15 y últimos 15 partidos de la liga.
// Para el diseño actual ("pronosticá la fecha") alcanza — es ~una fecha de anticipación.
const BASE_URL = "https://www.thesportsdb.com/api/v1/json";

type TsdbEvent = {
  idEvent: string;
  idAPIfootball: string | null;
  strTimestamp: string | null;
  dateEvent: string | null;
  strTime: string | null;
  intRound: string | null;
  strStatus: string | null;
  strPostponed: string | null;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
};

async function fetchEvents(key: string, endpoint: string, leagueId: number): Promise<TsdbEvent[]> {
  const res = await fetch(`${BASE_URL}/${key}/${endpoint}?id=${leagueId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`TheSportsDB respondió ${res.status} en ${endpoint} para league=${leagueId}`);
  }
  const data = (await res.json()) as { events: TsdbEvent[] | null };
  return data.events ?? [];
}

// strTimestamp viene en UTC pero sin marca de zona ("2026-09-11T20:00:00"): sin la "Z",
// new Date() lo interpretaría como hora local del servidor.
function toIsoDate(ev: TsdbEvent): string {
  const ts = ev.strTimestamp?.trim();
  if (ts) return /(?:Z|[+-]\d\d:?\d\d)$/.test(ts) ? ts : `${ts}Z`;
  const date = ev.dateEvent || "1970-01-01";
  const time = ev.strTime?.slice(0, 8) || "00:00:00";
  return `${date}T${time}Z`;
}

function toStatusShort(ev: TsdbEvent): string {
  if (ev.strPostponed?.toLowerCase() === "yes") return "PST";
  const raw = ev.strStatus?.trim();
  if (raw && raw !== "null") return raw;
  // Sin estado explícito pero con goles cargados: el partido ya terminó.
  if (ev.intHomeScore !== null && ev.intAwayScore !== null) return "FT";
  return "NS";
}

function toScore(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapEvent(ev: TsdbEvent, seed: CompetitionSeed): ApiFixture {
  return {
    fixture: {
      // idAPIfootball (cuando está) mantiene el mismo externalId si algún día se pasa a
      // API-Football de pago; si falta, se cae al id propio de TheSportsDB.
      id: Number(ev.idAPIfootball) || Number(ev.idEvent),
      date: toIsoDate(ev),
      status: { short: toStatusShort(ev) },
    },
    league: {
      id: seed.theSportsDbLeagueId ?? seed.externalId,
      name: seed.name,
      season: seed.season,
      round: ev.intRound ? `Fecha ${ev.intRound}` : "Fecha",
      logo: "",
    },
    teams: {
      home: { id: Number(ev.idHomeTeam), name: ev.strHomeTeam, logo: ev.strHomeTeamBadge ?? "" },
      away: { id: Number(ev.idAwayTeam), name: ev.strAwayTeam, logo: ev.strAwayTeamBadge ?? "" },
    },
    goals: {
      home: toScore(ev.intHomeScore),
      away: toScore(ev.intAwayScore),
    },
  };
}

export const thesportsdbFixtureProvider: FixtureProvider = {
  async getFixtures(seed) {
    const leagueId = seed.theSportsDbLeagueId;
    if (!leagueId) {
      throw new Error(`La competencia "${seed.slug}" no tiene theSportsDbLeagueId configurado`);
    }
    // "123" es la key pública de prueba; conviene registrar una free propia en thesportsdb.com.
    const key = process.env.THESPORTSDB_KEY?.trim() || "123";

    const [upcoming, past] = await Promise.all([
      fetchEvents(key, "eventsnextleague.php", leagueId),
      fetchEvents(key, "eventspastleague.php", leagueId),
    ]);

    // Alrededor del kickoff un partido puede estar en las dos listas. La versión de
    // "pasados" trae el resultado, así que pisa a la de "próximos".
    const byId = new Map<string, TsdbEvent>();
    for (const ev of upcoming) byId.set(ev.idEvent, ev);
    for (const ev of past) byId.set(ev.idEvent, ev);

    return [...byId.values()]
      .filter((ev) => ev.idHomeTeam && ev.idAwayTeam)
      .map((ev) => mapEvent(ev, seed));
  },
};
