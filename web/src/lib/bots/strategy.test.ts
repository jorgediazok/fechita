import { describe, it, expect } from "vitest";
import { outcomeProbabilities, predictMatch } from "./strategy";

describe("outcomeProbabilities", () => {
  it("las tres probabilidades suman ~1", () => {
    const p = outcomeProbabilities(70, 55);
    expect(p.home + p.draw + p.away).toBeCloseTo(1, 5);
  });

  it("con fuerzas iguales, la localía inclina a favor del local", () => {
    const p = outcomeProbabilities(65, 65);
    expect(p.home).toBeGreaterThan(p.away);
  });

  it("el equipo mucho más fuerte es el favorito", () => {
    const p = outcomeProbabilities(90, 50);
    expect(p.home).toBeGreaterThan(p.draw);
    expect(p.home).toBeGreaterThan(p.away);
  });

  it("no hay probabilidades negativas", () => {
    for (const [h, a] of [[50, 90], [90, 50], [60, 60], [80, 62]]) {
      const p = outcomeProbabilities(h, a);
      expect(p.home).toBeGreaterThanOrEqual(0);
      expect(p.draw).toBeGreaterThanOrEqual(0);
      expect(p.away).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("predictMatch — determinismo", () => {
  it("misma seed → misma jugada, siempre", () => {
    const args = { homeStrength: 75, awayStrength: 60, skill: 0.7, seed: "bot42:match99" };
    const a = predictMatch(args);
    const b = predictMatch(args);
    expect(a).toEqual(b);
  });

  it("seeds distintas dan (en general) jugadas distintas", () => {
    const base = { homeStrength: 70, awayStrength: 70, skill: 0.5 };
    const dirs = new Set(
      Array.from({ length: 30 }, (_, i) => predictMatch({ ...base, seed: `s${i}` }).direction)
    );
    expect(dirs.size).toBeGreaterThan(1);
  });
});

describe("predictMatch — efecto del skill", () => {
  const strong = { homeStrength: 88, awayStrength: 52 };
  const seeds = Array.from({ length: 400 }, (_, i) => `seed-${i}`);

  const favoriteRate = (skill: number) =>
    seeds.filter((seed) => predictMatch({ ...strong, skill, seed }).direction === "home").length /
    seeds.length;

  it("skill alto le pega al favorito más seguido que skill bajo", () => {
    expect(favoriteRate(1)).toBeGreaterThan(favoriteRate(0));
  });

  it("skill 0 nunca juega el marcador exacto (bonus atado al skill)", () => {
    const anyExact = seeds.some((seed) => {
      const p = predictMatch({ ...strong, skill: 0, seed });
      return p.homeScore !== null;
    });
    expect(anyExact).toBe(false);
  });

  it("skill alto sí juega el marcador exacto a veces", () => {
    const someExact = seeds.some((seed) => {
      const p = predictMatch({ homeStrength: 75, awayStrength: 60, skill: 1, seed });
      return p.homeScore !== null;
    });
    expect(someExact).toBe(true);
  });

  it("cuando hay marcador exacto, su dirección coincide con la ficha", () => {
    for (const seed of seeds) {
      const p = predictMatch({ homeStrength: 75, awayStrength: 60, skill: 1, seed });
      if (p.homeScore === null || p.awayScore === null) continue;
      const dir =
        p.homeScore > p.awayScore ? "home" : p.homeScore < p.awayScore ? "away" : "draw";
      expect(dir).toBe(p.direction);
    }
  });
});
