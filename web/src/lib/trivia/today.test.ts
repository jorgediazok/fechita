import { describe, it, expect } from "vitest";
import { triviaDayKey, questionForDay, todaysQuestion } from "./today";
import { TRIVIA_QUESTIONS } from "./catalog";

describe("triviaDayKey", () => {
  it("formatea como YYYY-MM-DD", () => {
    expect(triviaDayKey(new Date("2026-09-11T15:00:00Z"))).toBe("2026-09-11");
  });

  it("usa la medianoche de Argentina (UTC-3), no la de UTC", () => {
    // 02:59 UTC del día 11 todavía es 23:59 del 10 en Argentina.
    expect(triviaDayKey(new Date("2026-09-11T02:59:00Z"))).toBe("2026-09-10");
    // 03:01 UTC del día 11 ya es 00:01 del 11 en Argentina.
    expect(triviaDayKey(new Date("2026-09-11T03:01:00Z"))).toBe("2026-09-11");
  });
});

describe("questionForDay", () => {
  it("es determinística: mismo día → misma pregunta siempre", () => {
    const a = questionForDay("2026-09-11");
    const b = questionForDay("2026-09-11");
    expect(a.id).toBe(b.id);
  });

  it("devuelve una pregunta real del catálogo", () => {
    const q = questionForDay("2026-09-11");
    expect(TRIVIA_QUESTIONS.some((tq) => tq.id === q.id)).toBe(true);
  });

  it("días distintos suelen dar preguntas distintas (no siempre la misma)", () => {
    const days = Array.from({ length: 30 }, (_, i) => `2026-01-${String(i + 1).padStart(2, "0")}`);
    const ids = new Set(days.map((d) => questionForDay(d).id));
    // Con 61 preguntas y 30 días, sería extremadísimo que el hash colapsara a un puñado.
    expect(ids.size).toBeGreaterThan(10);
  });
});

describe("todaysQuestion", () => {
  it("combina triviaDayKey + questionForDay", () => {
    const date = new Date("2026-09-11T15:00:00Z");
    expect(todaysQuestion(date).id).toBe(questionForDay(triviaDayKey(date)).id);
  });
});
