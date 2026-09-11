"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { answerTriviaAction } from "@/app/pronosticos/actions";
import type { TriviaState } from "@/lib/trivia";

// Ícono de trivia en el hero de /pronosticos (al lado de la campanita) + el modal en sí,
// autocontenido igual que StreakInfo.tsx (ancla arriba-centro, no full-screen — no le pisa
// protagonismo a los partidos). Dos formas de abrirlo: automática al entrar a la pantalla
// (`autoOpen`, solo si no hay nada de más prioridad en cola — ver pronosticos/page.tsx) o
// tocando el ícono, que queda visible mientras no la respondiste hoy.
export function TriviaModal({ initial, autoOpen }: { initial: TriviaState; autoOpen: boolean }) {
  const [state, setState] = useState(initial);
  const [open, setOpen] = useState(autoOpen);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

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

  // Ya la respondió: no queda nada para abrir (ni ícono, ni modal manual).
  if (state.answered && !open) return null;

  return (
    <>
      {!state.answered && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label="Trivia del día — todavía sin responder"
          className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 transition active:scale-90"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9.2" stroke="#F5F5FF" strokeWidth="1.6" />
            <text x="12" y="16.3" textAnchor="middle" fontSize="11" fontWeight="800" fill="#F5F5FF">
              ?
            </text>
          </svg>
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B0C16] bg-[#FF4D6D]" />
        </button>
      )}

      {open &&
        createPortal(
          <div
            className="absolute inset-0 z-[60] flex items-start justify-center bg-black/60 px-3 pt-5"
            role="dialog"
            aria-modal="true"
            aria-label="Trivia del día"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="w-full max-w-[404px] rounded-2xl border border-[#262844] bg-[#15162A] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8A8FB2]">
                  Trivia del día · {state.category}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8A8FB2]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <p className="mt-1.5 font-display text-[16px] leading-snug text-[#E4E6F7]">
                {state.question}
              </p>

              <div className="mt-3.5 flex flex-col gap-2" role="group" aria-label="Opciones de la trivia">
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
                    : "Esta vez no. Volvé mañana por otra."}
                </p>
              )}
              {error && <p className="mt-3 text-[12px] font-bold text-[#FFA9B6]">{error}</p>}

              {state.answered && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 w-full rounded-2xl bg-[#1F2038] py-3 text-sm font-bold text-[#9195C2]"
                >
                  Listo
                </button>
              )}
            </div>
          </div>,
          document.getElementById("phone-frame") ?? document.body
        )}
    </>
  );
}
