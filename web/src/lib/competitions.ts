export type CompetitionSeed = {
  // Id en API-Football (Liga Profesional Argentina = 128). En modo mock se usa 999.
  externalId: number;
  season: number;
  name: string;
  slug: string;
  logoUrl: string;
  // Id de la misma liga en TheSportsDB (Argentinian Primera Division = 4406). Lo usa
  // thesportsdbProvider; los otros providers lo ignoran.
  theSportsDbLeagueId?: number;
  // The Odds API no da número de fecha. El provider agrupa los partidos en fechas y las
  // numera desde este ancla: "la fecha que arranca en/después de `date` es la número `round`".
  // Ajustá `round` si los números salen corridos. Solo lo usa theoddsapiProvider.
  theOddsApiRoundAnchor?: { date: string; round: number };
};

// Alcance definido en docs/product-design.md. Por ahora solo Liga Profesional Argentina
// tiene fixtures simulados en el modo mock (ver src/lib/api-football/mockProvider.ts).
export const COMPETITIONS: CompetitionSeed[] = [
  {
    externalId: 999,
    season: 2026,
    name: "Liga Profesional Argentina",
    slug: "liga-profesional",
    logoUrl: "",
    theSportsDbLeagueId: 4406,
    // La fecha que se juega alrededor del 11/09/2026 es la 15 del Torneo Clausura.
    // Verificá contra promiedos.com.ar y corregí si hace falta.
    theOddsApiRoundAnchor: { date: "2026-09-11", round: 15 },
  },
];
