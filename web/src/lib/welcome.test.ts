import { describe, it, expect } from "vitest";
import { isTriviaEligible } from "./welcome";

describe("isTriviaEligible", () => {
  it("false si todavía no completó la bienvenida", () => {
    expect(isTriviaEligible({ welcomedAt: null })).toBe(false);
  });

  it("false el mismo día (huso argentino) en que completó la bienvenida", () => {
    // 14:00 UTC del 11/9 es igual de tarde (11:00 Argentina) del mismo día.
    const welcomedAt = new Date("2026-09-11T14:00:00Z");
    const now = new Date("2026-09-11T23:00:00Z"); // 20:00 en Argentina, mismo día
    expect(isTriviaEligible({ welcomedAt }, now)).toBe(false);
  });

  it("true al día siguiente (huso argentino), aunque falten pocas horas", () => {
    const welcomedAt = new Date("2026-09-11T23:50:00Z"); // 20:50 del 11 en Argentina
    const now = new Date("2026-09-12T03:10:00Z"); // 00:10 del 12 en Argentina — ya es otro día
    expect(isTriviaEligible({ welcomedAt }, now)).toBe(true);
  });
});
