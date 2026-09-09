import type { FixtureProvider } from "./provider";
import { mockFixtureProvider } from "./mockProvider";
import { replayFixtureProvider } from "./replayProvider";
import { liveFixtureProvider } from "./liveProvider";
import { thesportsdbFixtureProvider } from "./thesportsdbProvider";
import { getFixtureSource } from "./source";

export function getFixtureProvider(): FixtureProvider {
  switch (getFixtureSource()) {
    case "replay":
      return replayFixtureProvider;
    case "thesportsdb":
      return thesportsdbFixtureProvider;
    case "api-football":
      return liveFixtureProvider;
    default:
      return mockFixtureProvider;
  }
}

export type { FixtureProvider } from "./provider";
export type { ApiFixture } from "./types";
export { mapApiStatus } from "./statusMap";
export { getFixtureSource, isMockMode, isReplayMode, type FixtureSource } from "./source";
export { setMockResult, resetMockFixture, postponeMockFixture } from "./mockProvider";
