import type { ApiFixture } from "./types";
import type { CompetitionSeed } from "../competitions";

// "recent": solo interesa el estado de los partidos de las últimas horas (poleo barato para
// agarrar un resultado ni bien termina). "full": refresco completo de fixtures + resultados.
export type FetchWindow = "recent" | "full";

export interface FixtureProvider {
  // Recibe el seed completo porque cada fuente identifica la competencia con su propio id
  // (API-Football usa externalId, TheSportsDB usa theSportsDbLeagueId).
  getFixtures(seed: CompetitionSeed, window?: FetchWindow): Promise<ApiFixture[]>;
}
