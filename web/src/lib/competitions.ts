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
  },
];
