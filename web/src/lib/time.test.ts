import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isPast,
  predictionLockAt,
  isPredictionLocked,
  isWithinDays,
  isWithinPastDays,
  PREDICTION_LOCK_LEAD_MS,
} from "./time";

const NOW = new Date("2026-09-10T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("isPast", () => {
  it("true si la fecha ya pasó", () => {
    expect(isPast(new Date(NOW.getTime() - 1000))).toBe(true);
  });
  it("false si la fecha es futura", () => {
    expect(isPast(new Date(NOW.getTime() + 1000))).toBe(false);
  });
  it("acepta string", () => {
    expect(isPast("2020-01-01T00:00:00.000Z")).toBe(true);
  });
});

describe("predictionLockAt / isPredictionLocked", () => {
  it("el cierre es 1 hora antes del kickoff", () => {
    const kickoff = new Date(NOW.getTime() + 5 * HOUR);
    expect(predictionLockAt(kickoff).getTime()).toBe(kickoff.getTime() - PREDICTION_LOCK_LEAD_MS);
  });

  it("abierto si faltan más de 60 min para el kickoff", () => {
    expect(isPredictionLocked(new Date(NOW.getTime() + 61 * 60 * 1000))).toBe(false);
  });

  it("cerrado si faltan menos de 60 min", () => {
    expect(isPredictionLocked(new Date(NOW.getTime() + 59 * 60 * 1000))).toBe(true);
  });

  it("cerrado justo en el límite de los 60 min", () => {
    expect(isPredictionLocked(new Date(NOW.getTime() + 60 * 60 * 1000))).toBe(true);
  });

  it("cerrado si el partido ya arrancó", () => {
    expect(isPredictionLocked(new Date(NOW.getTime() - HOUR))).toBe(true);
  });
});

describe("isWithinDays", () => {
  it("true si la fecha cae dentro de la ventana futura", () => {
    expect(isWithinDays(new Date(NOW.getTime() + 2 * DAY), 3)).toBe(true);
  });
  it("false si la fecha está más lejos que la ventana", () => {
    expect(isWithinDays(new Date(NOW.getTime() + 5 * DAY), 3)).toBe(false);
  });
  it("una fecha pasada siempre está 'within'", () => {
    expect(isWithinDays(new Date(NOW.getTime() - DAY), 3)).toBe(true);
  });
});

describe("isWithinPastDays", () => {
  it("true si quedó en el pasado hace menos de N días", () => {
    expect(isWithinPastDays(new Date(NOW.getTime() - 2 * DAY), 3)).toBe(true);
  });
  it("false si quedó en el pasado hace más de N días", () => {
    expect(isWithinPastDays(new Date(NOW.getTime() - 5 * DAY), 3)).toBe(false);
  });
});
