import type { FixtureProvider } from "./provider";
import { mockFixtureProvider } from "./mockProvider";
import { liveFixtureProvider } from "./liveProvider";

export function getFixtureProvider(): FixtureProvider {
  return process.env.API_FOOTBALL_MODE === "live" ? liveFixtureProvider : mockFixtureProvider;
}

export type { FixtureProvider } from "./provider";
export type { ApiFixture } from "./types";
export { mapApiStatus } from "./statusMap";
export { setMockResult, resetMockFixture } from "./mockProvider";
