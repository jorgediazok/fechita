import { describe, it, expect } from "vitest";
import { resultReadyMessage, badgeMessage, roundCloseMessage, roundClosingMessage } from "./messages";

describe("resultReadyMessage", () => {
  it("con puntos, los nombra en singular/plural", () => {
    expect(resultReadyMessage("Fecha 9", 1).body).toContain("1 punto");
    expect(resultReadyMessage("Fecha 9", 12).body).toContain("12 puntos");
  });
  it("sin puntos, mensaje neutro (no dice '0 puntos')", () => {
    const m = resultReadyMessage("Fecha 9", 0);
    expect(m.body).not.toContain("0 punto");
  });
  it("apunta a /liga y nombra la fecha en el título", () => {
    const m = resultReadyMessage("Fecha 9", 5);
    expect(m.url).toBe("/liga");
    expect(m.title).toContain("Fecha 9");
  });
});

describe("badgeMessage", () => {
  it("usa el nombre real del catálogo para una insignia conocida", () => {
    const m = badgeMessage("debut");
    expect(m.title).toBe("Nueva insignia: Debut");
    expect(m.url).toBe("/perfil/insignias");
  });
  it("no rompe con un id desconocido", () => {
    const m = badgeMessage("no-existe");
    expect(m.title).toBe("Nueva insignia");
    expect(m.body.length).toBeGreaterThan(0);
  });
});

describe("roundClosingMessage", () => {
  it("nombra la fecha en el título y manda a /pronosticos, no a /liga", () => {
    const m = roundClosingMessage("Fecha 9");
    expect(m.title).toContain("Fecha 9");
    expect(m.url).toBe("/pronosticos");
  });
});

describe("roundCloseMessage", () => {
  const base = { roundKey: "Fecha 9", newTier: "C" as const };

  it("ascenso", () => {
    const m = roundCloseMessage({ ...base, result: "promoted", wonRound: false });
    expect(m?.title).toContain("Ascendiste");
    expect(m?.title).toContain("Primera C");
  });
  it("descenso", () => {
    const m = roundCloseMessage({ ...base, result: "relegated", wonRound: false });
    expect(m?.title).toContain("Bajaste");
  });
  it("ganador de la fecha", () => {
    const m = roundCloseMessage({ ...base, result: "stayed", wonRound: true });
    expect(m?.title).toContain("Ganaste");
  });
  it("ganó la fecha y además ascendió", () => {
    const m = roundCloseMessage({ ...base, result: "promoted", wonRound: true });
    expect(m?.title).toContain("Ganaste");
    expect(m?.title).toContain("ascendiste");
  });
  it("se mantuvo sin ganar → no genera notificación", () => {
    expect(roundCloseMessage({ ...base, result: "stayed", wonRound: false })).toBeNull();
  });
});
