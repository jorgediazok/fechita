"use client";

import { useTransition } from "react";

// Festejo cuando la racha de fechas crece (calcado del anuncio de ascenso de /liga):
// fondo naranja, llama que entra con un resorte, el número nuevo, brasas subiendo.
export function StreakCelebration({
  streak,
  action,
}: {
  streak: number;
  action: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className="no-scrollbar absolute inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-y-auto px-6 py-10 text-center"
      style={{ background: "linear-gradient(165deg, #2A160B 0%, #14100B 55%, #0B0C16 100%)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Racha de ${streak} fechas`}
    >
      <style>{`
        @keyframes sc-pop { 0% { transform: scale(0.3); opacity: 0; } 62% { transform: scale(1.14); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes sc-fade { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes sc-glow { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 0.95; transform: scale(1.08); } }
        @keyframes sc-flicker { 0%, 100% { transform: scale(1) rotate(-1deg); } 50% { transform: scale(1.04) rotate(1deg); } }
        @keyframes sc-ember { 0% { transform: translateY(0) scale(1); opacity: 0.9; } 100% { transform: translateY(-120px) scale(0.3); opacity: 0; } }
        .sc-pop { animation: sc-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .sc-fade { animation: sc-fade 0.5s ease-out both; }
        .sc-glow { animation: sc-glow 2.4s ease-in-out infinite; }
        .sc-flicker { animation: sc-flicker 1.6s ease-in-out infinite; }
        .sc-ember { animation: sc-ember linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sc-pop, .sc-fade, .sc-glow, .sc-flicker, .sc-ember { animation: none !important; }
          .sc-ember { display: none; }
        }
      `}</style>

      <div className="relative flex flex-shrink-0 flex-col items-center">
        <div className="relative flex h-[200px] w-[200px] items-center justify-center">
          <div
            className="sc-glow absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,122,61,0.55), transparent 66%)" }}
          />
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="sc-ember absolute bottom-[70px] block h-1.5 w-1.5 rounded-full"
              style={{
                left: `${30 + i * 4.5}%`,
                background: i % 2 ? "#FFD75E" : "#FF7A3D",
                animationDuration: `${1.6 + (i % 4) * 0.5}s`,
                animationDelay: `${i * 0.22}s`,
              }}
            />
          ))}
          <div className="sc-pop relative">
            <div className="sc-flicker">
              <svg width="120" height="120" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2c1.1 3.1-1.6 4.7-1.6 7.4 0 1.4 1 2.3 1 2.3s2.7-2.1 2.2-4.8c2.1 2.1 3.7 4.8 3.7 7.8A5.3 5.3 0 0 1 6.7 15C6.7 10.3 11 8.1 12 2z"
                  fill="#FF7A3D"
                />
                <path
                  d="M12 9.5c0.5 1.6-0.8 2.4-0.8 3.8 0 0.9 0.7 1.7 1.6 1.7 1 0 1.8-0.8 1.8-2 0-1.3-1-2.4-2.6-3.5z"
                  fill="#FFD75E"
                />
              </svg>
            </div>
          </div>
          <span className="sc-pop absolute font-display text-[44px] text-[#0B0C16]" style={{ marginTop: "6px" }}>
            {streak}
          </span>
        </div>

        <div className="sc-fade mt-3 text-[11px] font-extrabold tracking-[0.18em] text-[#FFB27A]" style={{ animationDelay: "120ms" }}>
          SEGUÍS EN RACHA
        </div>
        <div className="sc-fade font-display text-[30px] leading-tight text-white" style={{ animationDelay: "180ms" }}>
          {streak} {streak === 1 ? "fecha" : "fechas"} seguidas
        </div>
        <p className="sc-fade mt-3 max-w-[30ch] text-sm font-semibold text-[#E4E6F7]" style={{ animationDelay: "260ms" }}>
          Le venís acertando a más de la mitad de tus pronósticos fecha tras fecha. No la cortes.
        </p>
      </div>

      <form
        action={() => startTransition(() => action())}
        className="sc-fade relative flex-shrink-0"
        style={{ animationDelay: "360ms" }}
      >
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-8 py-3 font-display text-sm text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #E0691E, #FF7A3D)" }}
        >
          DALE
        </button>
      </form>
    </div>
  );
}
