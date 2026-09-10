import { describe, it, expect } from "vitest";
import { zoneSize } from "./leagueZones";

describe("zoneSize", () => {
  it("grupos de 0 o 1 no tienen zona (nadie sube ni baja)", () => {
    expect(zoneSize(0)).toBe(0);
    expect(zoneSize(1)).toBe(0);
  });

  it("un grupo lleno (~24) mueve ~25% en cada punta", () => {
    expect(zoneSize(24)).toBe(6);
  });

  it("nunca supera la mitad del grupo (no se cruzan ascenso y descenso)", () => {
    // 25% de 2 = 0.5 → redondea a 1, pero mitad de 2 = 1 → 1.
    expect(zoneSize(2)).toBe(1);
    // 25% de 3 = 0.75 → 1; mitad de 3 (floor) = 1 → 1.
    expect(zoneSize(3)).toBe(1);
  });

  it("siempre al menos 1 en grupos de 2+", () => {
    for (let n = 2; n <= 40; n++) {
      expect(zoneSize(n)).toBeGreaterThanOrEqual(1);
      expect(zoneSize(n)).toBeLessThanOrEqual(Math.floor(n / 2));
    }
  });

  it("valores de referencia", () => {
    expect(zoneSize(6)).toBe(2); // seed de dev: 6 por tier
    expect(zoneSize(8)).toBe(2);
    expect(zoneSize(12)).toBe(3);
    expect(zoneSize(20)).toBe(5);
  });
});
