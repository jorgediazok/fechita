import { describe, it, expect } from "vitest";
import { currentRoundStreak } from "@/lib/badges/award";
import { makeUser, makeRoundMatches, finishRound, predictRound } from "../../../test/factories";

// Regla (lib/badges/award.ts): una fecha cuenta para la racha si el usuario cargó ≥3
// pronósticos y acertó MÁS de la mitad (`hits > total/2`, un acierto = ≥3 pts). La racha
// se cuenta hacia atrás desde la última fecha terminada y se corta en la primera que falla.

// Crea `n` fechas terminadas (kickoffs crecientes) de 4 partidos cada una.
async function makeFinishedRounds(n: number) {
  const rounds: { key: string; matches: { _id: import("mongoose").Types.ObjectId }[] }[] = [];
  for (let i = 1; i <= n; i++) {
    const key = `Fecha ${i}`;
    const matches = await makeRoundMatches(key, 4, {
      status: "scheduled",
      kickoffAt: new Date(Date.now() - (n - i + 1) * 24 * 60 * 60 * 1000),
    });
    await finishRound(key);
    rounds.push({ key, matches });
  }
  return rounds;
}

describe("currentRoundStreak", () => {
  it("sin fechas terminadas → 0", async () => {
    const user = await makeUser();
    await makeRoundMatches("Fecha 1", 4, { status: "scheduled" });
    expect(await currentRoundStreak(user._id)).toBe(0);
  });

  it("tres fechas seguidas acertando la mayoría → 3", async () => {
    const user = await makeUser();
    const rounds = await makeFinishedRounds(3);
    for (const r of rounds) await predictRound(user._id, r.matches, [3, 3, 3, 0]); // 3 de 4
    expect(await currentRoundStreak(user._id)).toBe(3);
  });

  it("se corta en la fecha que no llega a +50% (cuenta solo el tramo final)", async () => {
    const user = await makeUser();
    const rounds = await makeFinishedRounds(4);
    await predictRound(user._id, rounds[0].matches, [3, 3, 3, 3]); // ok
    await predictRound(user._id, rounds[1].matches, [3, 0, 0, 0]); // 1 de 4 → corta
    await predictRound(user._id, rounds[2].matches, [3, 3, 3, 0]); // ok
    await predictRound(user._id, rounds[3].matches, [3, 3, 0, 3]); // ok
    expect(await currentRoundStreak(user._id)).toBe(2);
  });

  it("exactamente la mitad no alcanza (necesita MÁS de la mitad)", async () => {
    const user = await makeUser();
    const rounds = await makeFinishedRounds(1);
    await predictRound(user._id, rounds[0].matches, [3, 3, 0, 0]); // 2 de 4 = mitad justa
    expect(await currentRoundStreak(user._id)).toBe(0);
  });

  it("menos de 3 pronósticos en la fecha no cuenta, aunque sean todos aciertos", async () => {
    const user = await makeUser();
    const rounds = await makeFinishedRounds(2);
    await predictRound(user._id, rounds[0].matches, [3, 3, 3, 0]); // ok
    await predictRound(user._id, rounds[1].matches, [5, 5, null, null]); // solo 2 pronósticos
    expect(await currentRoundStreak(user._id)).toBe(0); // la última corta, no hay racha viva
  });

  it("2 de 3 aciertos sí cuenta (más de la mitad con el mínimo de pronósticos)", async () => {
    const user = await makeUser();
    const rounds = await makeFinishedRounds(1);
    await predictRound(user._id, rounds[0].matches, [3, 5, 0, null]); // 3 pronósticos, 2 aciertos
    expect(await currentRoundStreak(user._id)).toBe(1);
  });
});
