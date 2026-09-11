"use client";

import { useState, useTransition } from "react";
import { answerTriviaAction } from "@/app/pronosticos/actions";
import type { TriviaState } from "@/lib/trivia";

// Tarjeta de la trivia diaria en /pronosticos — el gancho para los días sin partido (ver
// docs/product-design.md §"Retención entre fechas"). Múltiple choice, una ficha por opción,
// mismo criterio de interacción que el resto de la app (nada de texto libre). El servidor
// nunca manda el índice correcto hasta que el usuario responde — `initial.answered` solo
// viene seteado si ya contestó hoy.
export function TriviaCard({ initial }: { initial: TriviaState }) {
  const [state, setState] = useState(initial);
  // Si ya venía respondida desde el server (otra visita el mismo día), arranca colapsada —
  // no tiene sentido ocupar el feed todo el día con algo que ya jugaste. Si la responde
  // recién ahora, se queda expandida para que vea el resultado (pick() no la toca).
  const [expanded, setExpanded] = useState(!initial.answered);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick(index: number) {
    if (state.answered || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await answerTriviaAction(state.questionId, index);
      if (result.ok) {
        setState((s) => ({
          ...s,
          answered: { chosenIndex: index, correct: result.correct, correctIndex: result.correctIndex },
        }));
      } else if (result.reason === "stale") {
        setError("La trivia de hoy cambió mientras tenías la pantalla abierta — recargá la página.");
      } else if (result.reason === "already-answered") {
        setError("Ya habías respondido la de hoy — recargá la página para verla.");
      } else {
        setError("No se pudo registrar la respuesta. Probá de nuevo.");
      }
    });
  }

  if (!expanded && state.answered) {
    const correct = state.answered.correct;
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mx-4.5 mt-3 flex w-[calc(100%-2.25rem)] items-center justify-between rounded-2xl bg-[#15162A] px-4 py-3 text-left"
      >
        <span className="text-[12px] font-bold text-[#9195C2]">Trivia del día</span>
        <span
          className={`flex items-center gap-1 text-[12px] font-extrabold ${
            correct ? "text-[#4FD17F]" : "text-[#FF8FA6]"
          }`}
        >
          {correct ? "✓ Acertaste" : "✗ Esta vez no"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <div className="mx-4.5 mt-3 rounded-2xl bg-[#15162A] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8A8FB2]">
          Trivia del día · {state.category}
        </p>
        {state.answered && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Ocultar la trivia de hoy"
            className="shrink-0 text-[10px] font-extrabold uppercase tracking-wide text-[#8A8FB2] underline underline-offset-2"
          >
            Ocultar
          </button>
        )}
      </div>
      <p className="mt-1.5 font-display text-[15px] leading-snug text-[#E4E6F7]">{state.question}</p>

      <div className="mt-3 flex flex-col gap-2" role="group" aria-label="Opciones de la trivia">
        {state.options.map((opt, i) => {
          const answered = state.answered;
          const isChosen = answered?.chosenIndex === i;
          const isCorrectOption = answered?.correctIndex === i;

          let tone = "bg-[#1F2038] text-[#9195C2]";
          if (answered) {
            if (isCorrectOption) tone = "bg-[#173A28] text-[#4FD17F]";
            else if (isChosen) tone = "bg-[#3A1420] text-[#FF8FA6]";
            else tone = "bg-[#1F2038] text-[#5D6088]";
          }

          return (
            <button
              key={i}
              type="button"
              disabled={Boolean(answered) || pending}
              aria-pressed={isChosen}
              onClick={() => pick(i)}
              className={`rounded-xl px-3.5 py-2.5 text-left text-[13px] font-bold transition disabled:opacity-100 ${tone}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {state.answered && (
        <p
          className={`mt-3 text-[12px] font-bold ${
            state.answered.correct ? "text-[#4FD17F]" : "text-[#FFA9B6]"
          }`}
        >
          {state.answered.correct
            ? "¡Correcto! Suma a tu fecha (hasta 5 por fecha) y a tus insignias de trivia."
            : `Esta vez no. Volvé mañana por otra.`}
        </p>
      )}
      {error && <p className="mt-3 text-[12px] font-bold text-[#FFA9B6]">{error}</p>}
    </div>
  );
}
