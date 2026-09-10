import type { ApiFixture } from "./types";
import type { FixtureProvider } from "./provider";
import type { CompetitionSeed } from "../competitions";

// The Odds API (the-odds-api.com): API de cuotas con endpoints de fixtures y resultados.
// Free tier: 500 créditos/mes. El endpoint /scores?daysFrom=3 devuelve próximos + en vivo +
// terminados de los últimos 3 días en una sola llamada (2 créditos) — con el cron 2×/día
// (vercel.json) son ~120 créditos/mes. Cubre `soccer_argentina_primera_division`.
//
// Lo que NO trae: número de fecha (se sintetiza acá), escudos ni IDs de equipo (se mapean
// por nombre a IDs de API-Football, abajo). La tabla real de la liga no hace falta — la
// liga de la app se calcula sola con los puntos.
const SPORT = "soccer_argentina_primera_division";
const BASE_URL = `https://api.the-odds-api.com/v4/sports/${SPORT}`;
const DAY_MS = 86_400_000;

type OddsEvent = {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  completed?: boolean;
  scores?: { name: string; score: string }[] | null;
};

// Nombre en The Odds API → { id de API-Football, nombre para mostrar }. El id se usa para el
// escudo (media.api-sports.io) y para deduplicar en la DB. Actualizá esto cuando ascienda un
// equipo nuevo (aparece un warn en consola con el nombre exacto que devuelve la API).
const TEAMS: Record<string, { id: number; name: string }> = {
  "Aldosivi Mar del Plata": { id: 463, name: "Aldosivi" },
  "Argentinos Juniors": { id: 458, name: "Argentinos Jrs" },
  "Atlético Huracán": { id: 445, name: "Huracán" },
  "Atlético Tucuman": { id: 455, name: "Atlético Tucumán" },
  Banfield: { id: 449, name: "Banfield" },
  "Barracas Central": { id: 2432, name: "Barracas Central" },
  "Belgrano de Cordoba": { id: 440, name: "Belgrano" },
  "Boca Juniors": { id: 451, name: "Boca Juniors" },
  "CA Tigre BA": { id: 452, name: "Tigre" },
  "Central Córdoba": { id: 1065, name: "Central Córdoba (SdE)" },
  "Defensa y Justicia": { id: 442, name: "Defensa y Justicia" },
  "Deportivo Riestra": { id: 476, name: "Deportivo Riestra" },
  Estudiantes: { id: 450, name: "Estudiantes L.P." },
  "Estudiantes de Río Cuarto": { id: 27271, name: "Estudiantes (RC)" },
  "Gimnasia La Plata": { id: 434, name: "Gimnasia L.P." },
  "Gimnasia Mendoza": { id: 27272, name: "Gimnasia (M)" },
  "Godoy Cruz": { id: 439, name: "Godoy Cruz" },
  Independiente: { id: 453, name: "Independiente" },
  "Independiente Rivadavia": { id: 473, name: "Independiente Rivadavia" },
  "Instituto de Córdoba": { id: 478, name: "Instituto" },
  Lanus: { id: 446, name: "Lanús" },
  "Newells Old Boys": { id: 457, name: "Newell's Old Boys" },
  Platense: { id: 1064, name: "Platense" },
  "Racing Club": { id: 436, name: "Racing Club" },
  "River Plate": { id: 435, name: "River Plate" },
  "Rosario Central": { id: 437, name: "Rosario Central" },
  "San Lorenzo": { id: 460, name: "San Lorenzo" },
  "Sarmiento de Junin": { id: 474, name: "Sarmiento (J)" },
  Talleres: { id: 456, name: "Talleres" },
  "Union Santa Fe": { id: 441, name: "Unión Santa Fe" },
  "Velez Sarsfield BA": { id: 438, name: "Vélez Sarsfield" },
};

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  // Fuera del rango de IDs reales de API-Football para no colisionar.
  return 8_000_000 + (Math.abs(h) % 1_000_000);
}

function resolveTeam(name: string): { id: number; name: string; logo: string } {
  const known = TEAMS[name];
  if (known) {
    return { id: known.id, name: known.name, logo: `https://media.api-sports.io/football/teams/${known.id}.png` };
  }
  console.warn(`[theoddsapi] equipo sin mapear: "${name}" — va sin escudo, agregalo a TEAMS`);
  return { id: strHash(name), name, logo: "" };
}

// El id de The Odds API es hex de 32 chars. Tomamos 13 (52 bits) → entra en un Number seguro
// y es estable para el mismo partido.
function eventExternalId(id: string): number {
  return parseInt(id.slice(0, 13), 16);
}

function scoreFor(ev: OddsEvent, oddsTeamName: string): number | null {
  const entry = ev.scores?.find((s) => s.name === oddsTeamName);
  if (!entry) return null;
  const n = Number(entry.score);
  return Number.isFinite(n) ? n : null;
}

// The Odds API no da número de fecha. Se agrupan los partidos en "fechas" (corte cuando hay
// un hueco > 4 días) y se numeran desde un ancla configurable (competitions.ts).
function assignRounds(events: OddsEvent[], seed: CompetitionSeed): Map<string, string> {
  const anchor = seed.theOddsApiRoundAnchor;
  const sorted = [...events]
    .map((e) => ({ id: e.id, ms: new Date(e.commence_time).getTime() }))
    .sort((a, b) => a.ms - b.ms);

  const roundByEvent = new Map<string, string>();
  let clusterStartMs = -Infinity;
  let prevMs = -Infinity;

  for (const { id, ms } of sorted) {
    // Los partidos de una fecha caen jue-lun (huecos ≤ 2 días); entre fechas hay ≥ ~4 días.
    if (ms - prevMs > 2.5 * DAY_MS) clusterStartMs = ms;
    prevMs = ms;

    let label = "Fecha";
    if (anchor) {
      const weeks = Math.round((clusterStartMs - new Date(anchor.date).getTime()) / (7 * DAY_MS));
      label = `Fecha ${anchor.round + weeks}`;
    }
    roundByEvent.set(id, label);
  }
  return roundByEvent;
}

export const theoddsapiFixtureProvider: FixtureProvider = {
  async getFixtures(seed, window = "full") {
    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) throw new Error("Falta THE_ODDS_API_KEY para usar FIXTURE_SOURCE=theoddsapi");

    // `daysFrom` cuesta 1 crédito extra (2 en vez de 1). En modo "recent" (poleo para agarrar
    // un resultado recién terminado) no hace falta: el partido está en la respuesta igual.
    const daysFromParam = window === "full" ? "&daysFrom=3" : "";
    const url = `${BASE_URL}/scores/?apiKey=${apiKey}${daysFromParam}&dateFormat=iso`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`The Odds API respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const events = (await res.json()) as OddsEvent[];
    const rounds = assignRounds(events, seed);

    return events.map((ev): ApiFixture => {
      const home = resolveTeam(ev.home_team);
      const away = resolveTeam(ev.away_team);
      const finished = ev.completed === true;
      const homeGoals = scoreFor(ev, ev.home_team);
      const awayGoals = scoreFor(ev, ev.away_team);
      return {
        fixture: {
          id: eventExternalId(ev.id),
          date: new Date(ev.commence_time).toISOString(),
          status: { short: finished ? "FT" : new Date(ev.commence_time).getTime() < Date.now() ? "1H" : "NS" },
        },
        league: {
          id: seed.externalId,
          name: seed.name,
          season: seed.season,
          round: rounds.get(ev.id) ?? "Fecha",
          logo: seed.logoUrl,
        },
        teams: {
          home: { id: home.id, name: home.name, logo: home.logo },
          away: { id: away.id, name: away.name, logo: away.logo },
        },
        goals: {
          home: finished ? homeGoals : null,
          away: finished ? awayGoals : null,
        },
      };
    });
  },
};
