import type { ApiFixture } from "./types";
import type { CompetitionSeed } from "../competitions";

// "recent": solo interesa el estado de los partidos de las últimas horas (poleo barato para
// agarrar un resultado ni bien termina). "full": refresco completo de fixtures + resultados.
export type FetchWindow = "recent" | "full";

export interface FixtureProvider {
  // Recibe el seed completo porque cada fuente identifica la competencia y numera las fechas
  // a su manera (The Odds API, por ejemplo, usa theOddsApiRoundAnchor).
  getFixtures(seed: CompetitionSeed, window?: FetchWindow): Promise<ApiFixture[]>;
}
