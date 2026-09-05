export type CompetitionSeed = {
  externalId: number;
  season: number;
  name: string;
  slug: string;
  logoUrl: string;
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
  },
];
