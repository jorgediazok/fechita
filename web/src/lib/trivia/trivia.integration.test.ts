import { describe, it, expect } from "vitest";
import TriviaAnswerModel from "@/models/TriviaAnswer";
import { answerTrivia, getTriviaState, totalTriviaHits } from "./index";
import { todaysQuestion } from "./today";
import { makeUser } from "../../../test/factories";

describe("answerTrivia", () => {
  it("registra la respuesta y dice si acertó o no", async () => {
    const user = await makeUser();
    const q = todaysQuestion();
    const wrongIndex = (q.correctIndex + 1) % q.options.length;

    const result = await answerTrivia(user._id, q.id, wrongIndex);
    expect(result).toEqual({ ok: true, correct: false, correctIndex: q.correctIndex });

    const correctResult = await answerTrivia((await makeUser())._id, q.id, q.correctIndex);
    expect(correctResult).toEqual({ ok: true, correct: true, correctIndex: q.correctIndex });
  });

  it("no deja responder dos veces el mismo día", async () => {
    const user = await makeUser();
    const q = todaysQuestion();

    await answerTrivia(user._id, q.id, q.correctIndex);
    const second = await answerTrivia(user._id, q.id, q.correctIndex);
    expect(second).toEqual({ ok: false, reason: "already-answered" });
  });

  it("rechaza un questionId que no es el de hoy (la pregunta cambió)", async () => {
    const user = await makeUser();
    const result = await answerTrivia(user._id, "pregunta-inexistente", 0);
    expect(result).toEqual({ ok: false, reason: "stale" });
  });

  it("rechaza un índice de opción inválido", async () => {
    const user = await makeUser();
    const q = todaysQuestion();
    const result = await answerTrivia(user._id, q.id, 99);
    expect(result).toEqual({ ok: false, reason: "invalid-option" });
  });
});

describe("getTriviaState", () => {
  it("no revela el índice correcto antes de responder", async () => {
    const user = await makeUser();
    const state = await getTriviaState(user._id);
    expect(state.answered).toBeNull();
    expect(state).not.toHaveProperty("correctIndex");
  });

  it("después de responder, incluye el resultado", async () => {
    const user = await makeUser();
    const q = todaysQuestion();
    await answerTrivia(user._id, q.id, q.correctIndex);

    const state = await getTriviaState(user._id);
    expect(state.answered).toEqual({
      chosenIndex: q.correctIndex,
      correct: true,
      correctIndex: q.correctIndex,
    });
  });
});

describe("totalTriviaHits", () => {
  it("cuenta solo los aciertos, no los errores, de por vida sin tope", async () => {
    const user = await makeUser();
    const q = todaysQuestion();
    const wrongIndex = (q.correctIndex + 1) % q.options.length;

    // Un acierto hoy…
    await answerTrivia(user._id, q.id, q.correctIndex);
    expect(await totalTriviaHits(user._id)).toBe(1);

    // …y un error simulado otro día (dayKey a mano, sin pasar por answerTrivia porque el
    // índice único es userId+dayKey y hoy ya está usado).
    await TriviaAnswerModel.create({
      userId: user._id,
      dayKey: "2000-01-01",
      questionId: q.id,
      chosenIndex: wrongIndex,
      correct: false,
    });
    expect(await totalTriviaHits(user._id)).toBe(1);

    // Otro acierto otro día más → ahora sí suma.
    await TriviaAnswerModel.create({
      userId: user._id,
      dayKey: "2000-01-02",
      questionId: q.id,
      chosenIndex: q.correctIndex,
      correct: true,
    });
    expect(await totalTriviaHits(user._id)).toBe(2);
  });
});

// Sanity check de que el modelo realmente vive en Mongo (no solo en memoria del proceso) —
// si el índice único userId+dayKey se rompiera, esto lo detectaría.
describe("índice único userId+dayKey", () => {
  it("existe y es único", async () => {
    const indexes = await TriviaAnswerModel.collection.indexes();
    const unique = indexes.find(
      (i) => i.unique && JSON.stringify(i.key) === JSON.stringify({ userId: 1, dayKey: 1 })
    );
    expect(unique).toBeDefined();
  });
});
