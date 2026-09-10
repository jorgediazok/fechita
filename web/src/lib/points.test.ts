import { describe, it, expect } from "vitest";
import { calculatePoints, directionFromScores } from "./points";

describe("directionFromScores", () => {
  it("gana el local", () => {
    expect(directionFromScores(2, 0)).toBe("home");
  });
  it("gana el visitante", () => {
    expect(directionFromScores(0, 1)).toBe("away");
  });
  it("empate", () => {
    expect(directionFromScores(1, 1)).toBe("draw");
    expect(directionFromScores(0, 0)).toBe("draw");
  });
});

describe("calculatePoints", () => {
  const result = { homeScore: 2, awayScore: 1 };

  it("5 puntos si el marcador exacto coincide", () => {
    expect(
      calculatePoints(
        { predictedDirection: "home", predictedHomeScore: 2, predictedAwayScore: 1 },
        result
      )
    ).toBe(5);
  });

  it("3 puntos si acierta la dirección pero no el marcador exacto", () => {
    expect(
      calculatePoints(
        { predictedDirection: "home", predictedHomeScore: 3, predictedAwayScore: 0 },
        result
      )
    ).toBe(3);
  });

  it("3 puntos si acierta la dirección y no cargó marcador", () => {
    expect(calculatePoints({ predictedDirection: "home" }, result)).toBe(3);
  });

  it("0 puntos si erra la dirección", () => {
    expect(calculatePoints({ predictedDirection: "away" }, result)).toBe(0);
    expect(
      calculatePoints(
        { predictedDirection: "draw", predictedHomeScore: 1, predictedAwayScore: 1 },
        result
      )
    ).toBe(0);
  });

  it("marcador exacto de un empate", () => {
    expect(
      calculatePoints(
        { predictedDirection: "draw", predictedHomeScore: 1, predictedAwayScore: 1 },
        { homeScore: 1, awayScore: 1 }
      )
    ).toBe(5);
  });

  it("un solo marcador cargado (media carga) no da bonus, cae a la dirección", () => {
    expect(
      calculatePoints(
        { predictedDirection: "home", predictedHomeScore: 2, predictedAwayScore: null },
        result
      )
    ).toBe(3);
  });

  it("marcador exacto correcto pero dirección mal cargada: igual da 5 (manda el marcador)", () => {
    // El marcador exacto coincide con el real → 5, sin importar predictedDirection.
    expect(
      calculatePoints(
        { predictedDirection: "away", predictedHomeScore: 2, predictedAwayScore: 1 },
        result
      )
    ).toBe(5);
  });
});
