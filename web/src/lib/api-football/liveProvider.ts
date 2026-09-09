import type { ApiFixture } from "./types";
import type { FixtureProvider } from "./provider";

// Key sacada directo en dashboard.api-football.com (no vía RapidAPI), así que el host
// y el header de auth son los de api-sports.io, no los de api-football-v1.p.rapidapi.com.
const BASE_URL = "https://v3.football.api-sports.io";

export const liveFixtureProvider: FixtureProvider = {
  async getFixtures(seed) {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      throw new Error("Falta API_FOOTBALL_KEY para usar FIXTURE_SOURCE=api-football");
    }

    const url = `${BASE_URL}/fixtures?league=${seed.externalId}&season=${seed.season}`;
    const res = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API-Football respondió ${res.status} para league=${seed.externalId} season=${seed.season}`);
    }

    const data = (await res.json()) as { response: ApiFixture[] };
    return data.response;
  },
};
