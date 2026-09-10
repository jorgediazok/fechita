import { describe, it, expect } from "vitest";
import {
  TIER_ORDER,
  tierCanPromote,
  tierCanRelegate,
  nextTierUp,
  nextTierDown,
} from "./tiers";

describe("tierCanPromote", () => {
  it("todas menos PRIMERA pueden ascender", () => {
    expect(tierCanPromote("D")).toBe(true);
    expect(tierCanPromote("NACIONAL")).toBe(true);
    expect(tierCanPromote("PRIMERA")).toBe(false);
  });
});

describe("tierCanRelegate", () => {
  it("todas menos D pueden descender", () => {
    expect(tierCanRelegate("D")).toBe(false);
    expect(tierCanRelegate("C")).toBe(true);
    expect(tierCanRelegate("PRIMERA")).toBe(true);
  });
});

describe("nextTierUp", () => {
  it("sube un escalón", () => {
    expect(nextTierUp("D")).toBe("C");
    expect(nextTierUp("B")).toBe("NACIONAL");
    expect(nextTierUp("NACIONAL")).toBe("PRIMERA");
  });
  it("desde PRIMERA se queda en PRIMERA (no hay más arriba)", () => {
    expect(nextTierUp("PRIMERA")).toBe("PRIMERA");
  });
});

describe("nextTierDown", () => {
  it("baja un escalón", () => {
    expect(nextTierDown("PRIMERA")).toBe("NACIONAL");
    expect(nextTierDown("C")).toBe("D");
  });
  it("desde D se queda en D (no hay más abajo)", () => {
    expect(nextTierDown("D")).toBe("D");
  });
});

it("up y down son inversos en el medio del recorrido", () => {
  for (const tier of TIER_ORDER.slice(1, -1)) {
    expect(nextTierDown(nextTierUp(tier))).toBe(tier);
  }
});
