import { cyrb53 } from "../hash";
import { TRIVIA_QUESTIONS, type TriviaQuestionDef } from "./catalog";

// Huso horario argentino — la trivia "de hoy" cambia a la medianoche de Argentina, no de
// UTC (coherente con que la app es 100% para el público argentino). Se usa siempre esto en
// vez de `new Date().toDateString()`, sin importar en qué región corre el server.
const ARG_TZ = "America/Argentina/Buenos_Aires";

// "YYYY-MM-DD" en huso argentino. El locale en-CA formatea así de fábrica (evita armar el
// string a mano con getFullYear/getMonth/getDate, que traería la hora del server, no la de
// Argentina).
export function triviaDayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ARG_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// La pregunta del día: determinística por dayKey (cyrb53 del string, módulo el largo del
// banco) — todos los usuarios ven la misma pregunta el mismo día, un re-render no la
// cambia, y no hace falta persistir "la pregunta de hoy" en ningún lado. Cuando el banco
// crece, el recorrido se reordena solo (el hash no es secuencial) — no hay que tocar nada.
export function questionForDay(dayKey: string): TriviaQuestionDef {
  const idx = cyrb53(dayKey) % TRIVIA_QUESTIONS.length;
  return TRIVIA_QUESTIONS[idx];
}

export function todaysQuestion(date: Date = new Date()): TriviaQuestionDef {
  return questionForDay(triviaDayKey(date));
}
