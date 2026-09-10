"use client";

import { useEffect, useState } from "react";

// Chip de racha del hero de /pronosticos + modal que explica qué es y cómo se consigue.
// La regla real vive en lib/badges/award.ts (`currentRoundStreak`): una fecha suma si
// cargaste ≥3 pronósticos y acertaste más de la mitad; si una no cumple, vuelve a 0.
export function StreakInfo({ streak, atRisk }: { streak: number; atRisk: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const bg = atRisk
    ? "rgba(255,255,255,0.14)"
    : streak > 0
      ? "rgba(255,122,61,0.28)"
      : "rgba(255,255,255,0.10)";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={
          streak > 0
            ? `Racha de ${streak} fecha${streak === 1 ? "" : "s"}${atRisk ? ", en juego" : ""}. Ver cómo funciona`
            : "Sin racha. Ver cómo funciona"
        }
        className="flex items-center gap-1 rounded-full py-1 pl-1.5 pr-2.5 transition active:scale-95"
        style={{ background: bg }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2c1.1 3.1-1.6 4.7-1.6 7.4 0 1.4 1 2.3 1 2.3s2.7-2.1 2.2-4.8c2.1 2.1 3.7 4.8 3.7 7.8A5.3 5.3 0 0 1 6.7 15C6.7 10.3 11 8.1 12 2z"
            fill={streak > 0 && !atRisk ? "#FF9D5C" : "#F5F5FF"}
            fillOpacity={streak > 0 ? 1 : 0.5}
          />
        </svg>
        <span className="font-display text-[13px] leading-none text-[#F5F5FF]">{streak}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 px-4 pb-4 pt-10 md:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Tu racha"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-[400px] rounded-3xl border border-[#262844] bg-[#15162A] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ background: "rgba(255,122,61,0.22)" }}
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    d="M12 2c1.1 3.1-1.6 4.7-1.6 7.4 0 1.4 1 2.3 1 2.3s2.7-2.1 2.2-4.8c2.1 2.1 3.7 4.8 3.7 7.8A5.3 5.3 0 0 1 6.7 15C6.7 10.3 11 8.1 12 2z"
                    fill="#FF9D5C"
                  />
                </svg>
              </span>
              <div>
                <p className="font-display text-lg leading-tight text-[#E4E6F7]">TU RACHA</p>
                <p className="text-[12px] font-bold text-[#8A8FB2]">
                  {streak > 0
                    ? `${streak} fecha${streak === 1 ? "" : "s"} seguida${streak === 1 ? "" : "s"} fino`
                    : "Todavía no arrancaste una"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0B0C16] p-4">
              <p className="text-[10px] font-extrabold tracking-wide text-[#57628A]">
                UNA FECHA SUMA A TU RACHA SI
              </p>
              <ul className="mt-2 flex flex-col gap-1.5 text-[13px] font-semibold text-[#E4E6F7]">
                <li className="flex gap-2">
                  <span className="text-[#FF9D5C]">•</span> Cargaste al menos <b>3 pronósticos</b> esa fecha
                </li>
                <li className="flex gap-2">
                  <span className="text-[#FF9D5C]">•</span> Le acertaste a <b>más de la mitad</b>
                </li>
              </ul>
            </div>

            <p className="mt-3 text-[12px] font-semibold leading-relaxed text-[#9195C2]">
              Si una fecha no cumple, la racha vuelve a 0. A las <b>3</b>, <b>5</b> y <b>8</b> fechas
              seguidas ganás una insignia 🔥
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-2xl bg-[#1F2038] py-3 text-sm font-bold text-[#9195C2]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
