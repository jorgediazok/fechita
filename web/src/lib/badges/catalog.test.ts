import { describe, it, expect } from "vitest";
import {
  BADGES,
  BADGE_IDS,
  BADGE_GROUPS,
  NON_META_BADGE_IDS,
  META_BADGE_ID,
  RARITY,
  GROUP_LABELS,
  getBadge,
} from "./catalog";

describe("catálogo de insignias", () => {
  it("todos los ids son únicos", () => {
    expect(new Set(BADGE_IDS).size).toBe(BADGES.length);
  });

  it("toda insignia referencia una rareza y un grupo definidos", () => {
    for (const badge of BADGES) {
      expect(RARITY[badge.rarity]).toBeDefined();
      expect(GROUP_LABELS[badge.group]).toBeDefined();
    }
  });

  it("la insignia meta (coleccionista) es la única del grupo 'meta'", () => {
    const metaBadges = BADGES.filter((b) => b.group === "meta");
    expect(metaBadges).toHaveLength(1);
    expect(metaBadges[0].id).toBe(META_BADGE_ID);
  });

  it("NON_META_BADGE_IDS excluye la meta y trae todas las demás", () => {
    expect(NON_META_BADGE_IDS).not.toContain(META_BADGE_ID);
    expect(NON_META_BADGE_IDS).toHaveLength(BADGES.length - 1);
  });

  it("getBadge encuentra por id y no rompe con un id inexistente", () => {
    expect(getBadge(META_BADGE_ID)?.name).toBe("Las tenés todas");
    expect(getBadge("no-existe")).toBeUndefined();
  });

  it("BADGE_GROUPS reparte exactamente todas las insignias, sin repetir", () => {
    const total = BADGE_GROUPS.reduce((sum, g) => sum + g.badges.length, 0);
    expect(total).toBe(BADGES.length);
    const idsInGroups = BADGE_GROUPS.flatMap((g) => g.badges.map((b) => b.id));
    expect(new Set(idsInGroups).size).toBe(BADGES.length);
  });

  it("cada grupo en BADGE_GROUPS solo contiene insignias de ese grupo", () => {
    for (const { group, badges } of BADGE_GROUPS) {
      expect(badges.every((b) => b.group === group)).toBe(true);
    }
  });
});
