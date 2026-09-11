import { describe, it, expect } from "vitest";
import TriviaAnswerModel from "@/models/TriviaAnswer";
import { enrollUserForCurrentRound, getGroupStanding, getCurrentRoundKey } from "@/lib/leagues";
import { TRIVIA_ROUND_CAP } from "@/lib/trivia";
import { triviaDayKey } from "@/lib/trivia/today";
import { makeUser, makeRoundMatches } from "../../test/factories";

// Le da a un usuario `n` aciertos de trivia con dayKey dentro de la ventana [from, to]
// (inclusive, un día por acierto, arrancando en `from`). No pasa por answerTrivia() porque
// el índice único es userId+dayKey y acá se necesita controlar la fecha exacta.
async function giveTriviaHits(userId: unknown, from: Date, n: number) {
  for (let i = 0; i < n; i++) {
    const day = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    await TriviaAnswerModel.create({
      userId,
      dayKey: triviaDayKey(day),
      questionId: "trivia-de-prueba",
      chosenIndex: 0,
      correct: true,
    });
  }
}

describe("bonus de trivia en la liga por fecha", () => {
  it("suma los aciertos de trivia de la ventana de la fecha, con tope de 5", async () => {
    const user = await makeUser();
    // Una fecha real dura varios días (jueves-lunes) — dos tandas de partidos para que
    // getRoundBounds() dé una ventana de más de un día, como en la app real.
    const first = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const last = new Date(first.getTime() + 6 * 24 * 60 * 60 * 1000);
    await makeRoundMatches("Fecha 1", 2, { status: "scheduled", kickoffAt: first });
    await makeRoundMatches("Fecha 1", 2, { status: "scheduled", kickoffAt: last });

    const { group } = await enrollUserForCurrentRound(user._id);
    expect(await getCurrentRoundKey()).toBe("Fecha 1");

    // 8 aciertos de trivia, todos dentro de la ventana de la fecha — el bonus se topea en 5.
    await giveTriviaHits(user._id, first, 8);

    const standing = await getGroupStanding(group._id);
    const me = standing.find((r) => String(r.membership.userId) === String(user._id));
    expect(me?.points).toBe(TRIVIA_ROUND_CAP);
  });

  it("no cuenta aciertos de trivia de fuera de la ventana de la fecha", async () => {
    const user = await makeUser();
    const first = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await makeRoundMatches("Fecha 1", 3, { status: "scheduled", kickoffAt: first });

    const { group } = await enrollUserForCurrentRound(user._id);

    // Un acierto bien lejos en el pasado, fuera de la ventana de "Fecha 1".
    await TriviaAnswerModel.create({
      userId: user._id,
      dayKey: "2000-01-01",
      questionId: "trivia-de-prueba",
      chosenIndex: 0,
      correct: true,
    });

    const standing = await getGroupStanding(group._id);
    const me = standing.find((r) => String(r.membership.userId) === String(user._id));
    expect(me?.points).toBe(0);
  });

  it("un acierto de trivia solo, sin pronósticos puntuados, alcanza para tener puntos > 0", async () => {
    const user = await makeUser();
    const first = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await makeRoundMatches("Fecha 1", 3, { status: "scheduled", kickoffAt: first });

    const { group } = await enrollUserForCurrentRound(user._id);
    await giveTriviaHits(user._id, first, 2);

    const standing = await getGroupStanding(group._id);
    const me = standing.find((r) => String(r.membership.userId) === String(user._id));
    expect(me?.points).toBe(2);
  });
});
