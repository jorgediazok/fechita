"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Si el usuario termina de cargar el último pronóstico de la fecha estando scrolleado
// abajo del todo, nunca ve que la tarjeta "¡Listo!" de arriba (RoundProgress) se puso verde.
// Este toast avisa ahí mismo, sin sacarlo de donde está ni pedirle nada — se dispara solo
// una vez, en la transición de "no completo" a "completo" dentro de la misma visita (si ya
// entra con la fecha completa, o la completa y vuelve a entrar después, no vuelve a sonar).
export function RoundCompleteToast({ roundKey, done }: { roundKey: string; done: boolean }) {
  // `visible` arranca siempre en false (a diferencia de TriviaModal, acá no hay un caso de
  // "nace abierto" en el mismo render que hidrata) — createPortal no tiene el problema de
  // montar en el vacío que documenta TriviaModal.tsx, no hace falta esperar un tick extra.
  const [visible, setVisible] = useState(false);
  const wasDone = useRef(done);

  useEffect(() => {
    if (done && !wasDone.current) setVisible(true);
    wasDone.current = done;
  }, [done]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 bottom-24 z-40 flex justify-center px-6"
    >
      <div className="lp-toast-in flex items-center gap-2 rounded-full border border-[#4FD17F]/35 bg-[#122019] px-4 py-2.5 text-[13px] font-extrabold text-[#CDEFD9] shadow-[0_14px_34px_rgba(0,0,0,0.5)]">
        <span aria-hidden="true">🎉</span>
        Cargaste toda la {roundKey}
      </div>
      <style>{`
        @keyframes rct-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .lp-toast-in { animation: rct-in 0.3s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .lp-toast-in { animation: none !important; }
        }
      `}</style>
    </div>,
    document.getElementById("phone-frame") ?? document.body
  );
}
