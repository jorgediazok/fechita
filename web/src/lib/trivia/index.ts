import { Types } from "mongoose";
import { connectToDatabase } from "../db";
import TriviaAnswerModel from "@/models/TriviaAnswer";
import { todaysQuestion, triviaDayKey } from "./today";
import { TRIVIA_CATEGORY_LABELS } from "./catalog";

export { TRIVIA_CATEGORY_LABELS, triviaDayKey };

// Cuántos aciertos de trivia, como máximo, suman a la liga por fecha (docs/product-design.md
// §"Retención entre fechas") — el resto de aciertos igual cuentan para las insignias, pero
// no siguen empujando el ascenso. El ascenso tiene que seguir reflejando sobre todo que
// sabés predecir fútbol real, no trivia.
export const TRIVIA_ROUND_CAP = 5;

export type TriviaState = {
  questionId: string;
  question: string;
  options: string[];
  category: string;
  // Solo viene seteado si ya respondió hoy — el índice correcto no se manda al cliente
  // hasta contestar, para no poder verlo en el HTML antes de tocar una ficha.
  answered: { chosenIndex: number; correct: boolean; correctIndex: number } | null;
};

// Estado de la trivia de hoy para un usuario: la pregunta (sin revelar la respuesta) + si
// ya la contestó.
export async function getTriviaState(userId: Types.ObjectId | string): Promise<TriviaState> {
  await connectToDatabase();
  const dayKey = triviaDayKey();
  const q = todaysQuestion();

  const existing = await TriviaAnswerModel.findOne({ userId, dayKey }).lean();

  return {
    questionId: q.id,
    question: q.question,
    options: q.options,
    category: TRIVIA_CATEGORY_LABELS[q.category],
    answered: existing
      ? { chosenIndex: existing.chosenIndex, correct: existing.correct, correctIndex: q.correctIndex }
      : null,
  };
}

export type AnswerTriviaResult =
  | { ok: true; correct: boolean; correctIndex: number }
  | { ok: false; reason: "already-answered" | "stale" | "invalid-option" };

// Registra la respuesta del día. `questionId` viaja desde el cliente (lo que vio al cargar
// la pantalla) para detectar el caso raro de "tenía /pronosticos abierto de un día para el
// otro" — si la pregunta de hoy ya no es la que el cliente tenía, no se guarda nada en vez
// de puntuar contra la pregunta equivocada.
export async function answerTrivia(
  userId: Types.ObjectId | string,
  questionId: string,
  chosenIndex: number
): Promise<AnswerTriviaResult> {
  await connectToDatabase();
  const dayKey = triviaDayKey();
  const q = todaysQuestion();

  if (q.id !== questionId) return { ok: false, reason: "stale" };
  if (!Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex >= q.options.length) {
    return { ok: false, reason: "invalid-option" };
  }

  const correct = chosenIndex === q.correctIndex;
  try {
    await TriviaAnswerModel.create({ userId, dayKey, questionId, chosenIndex, correct });
  } catch (err: unknown) {
    if ((err as { code?: number })?.code === 11000) {
      return { ok: false, reason: "already-answered" };
    }
    throw err;
  }

  return { ok: true, correct, correctIndex: q.correctIndex };
}

// Aciertos de trivia de por vida — lo que alimenta las insignias (badges/award.ts), sin
// tope. El tope de TRIVIA_ROUND_CAP es solo para lo que suma a una fecha puntual de la liga
// (ver getTriviaRoundBonus en lib/leagues.ts).
export async function totalTriviaHits(userId: Types.ObjectId | string): Promise<number> {
  await connectToDatabase();
  return TriviaAnswerModel.countDocuments({ userId, correct: true });
}
