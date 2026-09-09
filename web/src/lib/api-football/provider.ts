import type { ApiFixture } from "./types";
import type { CompetitionSeed } from "../competitions";

export interface FixtureProvider {
  // Recibe el seed completo porque cada fuente identifica la competencia con su propio id
  // (API-Football usa externalId, TheSportsDB usa theSportsDbLeagueId).
  getFixtures(seed: CompetitionSeed): Promise<ApiFixture[]>;
}
