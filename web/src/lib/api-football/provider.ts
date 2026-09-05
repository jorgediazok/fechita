import type { ApiFixture } from "./types";

export interface FixtureProvider {
  getFixtures(leagueId: number, season: number): Promise<ApiFixture[]>;
}
