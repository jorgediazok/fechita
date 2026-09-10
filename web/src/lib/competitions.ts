export type CompetitionSeed = {
  // Id en API-Football (Liga Profesional Argentina = 128) — es el id canónico de equipos y
  // ligas en toda la app (el mock y el mapeo de The Odds API usan estos ids). En mock: 999.
  externalId: number;
  season: number;
  name: string;
  slug: string;
  logoUrl: string;
  // The Odds API no da número de fecha. El provider agrupa los partidos en fechas y las
  // numera desde este ancla: "la fecha que arranca en/después de `date` es la número `round`".
  // Ajustá `round` si los números salen corridos. Solo lo usa theoddsapiProvider.
  theOddsApiRoundAnchor?: { date: string; round: number };
};

// Alcance definido en docs/product-design.md. Por ahora solo Liga Profesional Argentina
// tiene fixtures simulados en el modo mock (ver src/lib/fixtures/mockProvider.ts).
export const COMPETITIONS: CompetitionSeed[] = [
  {
    externalId: 999,
    season: 2026,
    name: "Liga Profesional Argentina",
    slug: "liga-profesional",
    logoUrl: "",
    // La fecha 9 arranca el 11/09/2026 20:00 UTC (Newell's–Vélez). El ancla lleva la hora
    // real del primer partido, no la medianoche: si no, un cluster de la fecha anterior que
    // The Odds API todavía devuelve (ventana de 3 días) cae a ~-3 días del ancla y redondea
    // a la fecha equivocada en vez de a la de abajo. El torneo va hasta la fecha 16 y después
    // empiezan los playoffs — cuando lleguen, este numerado va a dar "Fecha 17+" y hay que
    // manejarlo aparte en theoddsapiProvider.
    theOddsApiRoundAnchor: { date: "2026-09-11T20:00:00Z", round: 9 },
  },
];
