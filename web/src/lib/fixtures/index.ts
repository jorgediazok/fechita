import type { FixtureProvider } from "./provider";
import { mockFixtureProvider } from "./mockProvider";
import { replayFixtureProvider } from "./replayProvider";
import { theoddsapiFixtureProvider } from "./theoddsapiProvider";
import { getFixtureSource } from "./source";

export function getFixtureProvider(): FixtureProvider {
  switch (getFixtureSource()) {
    case "theoddsapi":
      return theoddsapiFixtureProvider;
    case "replay":
      return replayFixtureProvider;
    default:
      return mockFixtureProvider;
  }
}

export type { FixtureProvider } from "./provider";
export type { ApiFixture } from "./types";
export { mapApiStatus } from "./statusMap";
export { getFixtureSource, isMockMode, isReplayMode, type FixtureSource } from "./source";
export { setMockResult, resetMockFixture, postponeMockFixture } from "./mockProvider";
