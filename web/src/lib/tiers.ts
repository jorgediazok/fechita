// Constantes de categorías de liga semanal, sin dependencias — separado de
// lib/leagues.ts (que sí toca modelos/DB) para evitar un import circular con
// los modelos que necesitan el enum de tier en su schema (User, WeeklyLeagueGroup).

export const TIER_ORDER = ["D", "C", "B", "NACIONAL", "PRIMERA"] as const;
export type TierCode = (typeof TIER_ORDER)[number];

// Etiquetas cortas para la barra de categorías (calcan los mockups de docs/product-design.md).
export const TIER_LABELS: Record<TierCode, string> = {
  D: "D",
  C: "C",
  B: "B",
  NACIONAL: "NAC.",
  PRIMERA: "1RA.",
};

export const TIER_FULL_NAMES: Record<TierCode, string> = {
  D: "Primera D",
  C: "Primera C",
  B: "Primera B",
  NACIONAL: "Primera Nacional",
  PRIMERA: "Primera División",
};

export function tierCanPromote(tier: TierCode) {
  return tier !== "PRIMERA";
}

export function tierCanRelegate(tier: TierCode) {
  return tier !== "D";
}

export function nextTierUp(tier: TierCode): TierCode {
  const idx = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[Math.min(idx + 1, TIER_ORDER.length - 1)];
}

export function nextTierDown(tier: TierCode): TierCode {
  const idx = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[Math.max(idx - 1, 0)];
}
