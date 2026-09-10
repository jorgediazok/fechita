import { describe, it, expect } from "vitest";
import { assignRounds } from "./theoddsapiProvider";
import type { CompetitionSeed } from "../competitions";

const seed = {
  theOddsApiRoundAnchor: { date: "2026-09-11T20:00:00Z", round: 9 },
} as CompetitionSeed;

// assignRounds solo lee id y commence_time.
function ev(id: string, commence_time: string) {
  return { id, commence_time } as Parameters<typeof assignRounds>[0][number];
}

describe("assignRounds", () => {
  it("numera fechas consecutivas desde el ancla", () => {
    const rounds = assignRounds(
      [
        ev("a", "2026-09-11T20:00:00Z"),
        ev("b", "2026-09-13T22:00:00Z"),
        ev("c", "2026-09-18T21:00:00Z"),
        ev("d", "2026-09-20T20:00:00Z"),
      ],
      seed
    );
    expect(rounds.get("a")).toBe("Fecha 9");
    expect(rounds.get("b")).toBe("Fecha 9");
    expect(rounds.get("c")).toBe("Fecha 10");
    expect(rounds.get("d")).toBe("Fecha 10");
  });

  it("un cluster de la fecha anterior (que The Odds API sigue devolviendo) va a la fecha de abajo, no a la actual", () => {
    const rounds = assignRounds(
      [
        // sobras de la fecha 8 dentro de la ventana daysFrom=3
        ev("old1", "2026-09-07T22:00:00Z"),
        ev("old2", "2026-09-08T00:15:00Z"),
        // fecha 9 real
        ev("new1", "2026-09-11T20:00:00Z"),
        ev("new2", "2026-09-12T00:30:00Z"),
      ],
      seed
    );
    expect(rounds.get("old1")).toBe("Fecha 8");
    expect(rounds.get("old2")).toBe("Fecha 8");
    expect(rounds.get("new1")).toBe("Fecha 9");
    expect(rounds.get("new2")).toBe("Fecha 9");
  });

  it("sin ancla, todo cae en la etiqueta genérica", () => {
    const rounds = assignRounds([ev("a", "2026-09-11T20:00:00Z")], {} as CompetitionSeed);
    expect(rounds.get("a")).toBe("Fecha");
  });
});
