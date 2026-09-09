"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PREDICTION_LOCK_LEAD_MS } from "@/lib/time";
import { clearExactScore, submitDirection, submitExactScore } from "./actions";

type Direction = "home" | "draw" | "away";

const DIR_LABELS: Record<Direction, string> = { home: "L", draw: "E", away: "V" };
const DIR_A11Y: Record<Direction, string> = {
  home: "Gana el local",
  draw: "Empate",
  away: "Gana el visitante",
};

const MIN = 0;
const MAX = 9;
const clamp = (n: number) => Math.max(MIN, Math.min(MAX, n));
const dirFromScore = (h: number, a: number): Direction => (h > a ? "home" : h < a ? "away" : "draw");

export function MatchPredictor({
  matchId,
  kickoffAt,
  homeShortName,
  awayShortName,
  initialDirection,
  initialHome,
  initialAway,
}: {
  matchId: string;
  kickoffAt: string;
  homeShortName: string;
  awayShortName: string;
  initialDirection: Direction | null;
  initialHome: number | null;
  initialAway: number | null;
}) {
  const hadScore = initialHome != null && initialAway != null;

  const [direction, setDirection] = useState<Direction | null>(initialDirection);
  const [home, setHome] = useState(initialHome ?? 0);
  const [away, setAway] = useState(initialAway ?? 0);
  const [scoreOn, setScoreOn] = useState(hadScore);
  // La carga cierra 1 h antes del kickoff. Puro tiempo contra kickoffAt, sin tocar la API.
  const lockAtMs = new Date(kickoffAt).getTime() - PREDICTION_LOCK_LEAD_MS;
  const [locked, setLocked] = useState(() => Date.now() >= lockAtMs);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  // Cierra la carga sola al llegar a la hora límite, aunque la pestaña quede abierta.
  useEffect(() => {
    if (locked) return;
    const msToLock = lockAtMs - Date.now();
    // setTimeout se desborda arriba de ~24.8 días; para partidos lejanos ni lo agendamos.
    if (msToLock > 2_000_000_000) return;
    const id = setTimeout(() => setLocked(true), Math.max(0, msToLock));
    return () => clearTimeout(id);
  }, [lockAtMs, locked]);

  if (locked) {
    return <p className="text-xs font-bold text-[#8A8FB2]">Carga cerrada — cierra 1 h antes del partido.</p>;
  }

  function cancelSave() {
    if (timer.current) clearTimeout(timer.current);
  }

  // Guarda en el server; si rebota (partido ya arrancado, según el reloj del server) cierra la carga.
  function save(action: () => Promise<unknown>) {
    startTransition(async () => {
      try {
        await action();
      } catch {
        setLocked(true);
      }
    });
  }

  function pickDirection(dir: Direction) {
    setDirection(dir);
    // Si venía con marcador exacto y ahora contradice la ficha, lo soltamos.
    if (scoreOn && dirFromScore(home, away) !== dir) {
      cancelSave();
      setScoreOn(false);
      setHome(0);
      setAway(0);
    }
    save(() => submitDirection(matchId, dir));
  }

  function bump(team: "home" | "away", delta: number) {
    const baseH = scoreOn ? home : 0;
    const baseA = scoreOn ? away : 0;
    const h = team === "home" ? clamp(baseH + delta) : baseH;
    const a = team === "away" ? clamp(baseA + delta) : baseA;
    setScoreOn(true);
    setHome(h);
    setAway(a);
    setDirection(dirFromScore(h, a)); // la ficha 1-X-2 se mueve en el acto
    cancelSave();
    timer.current = setTimeout(() => save(() => submitExactScore(matchId, h, a)), 300);
  }

  function clearScore() {
    cancelSave();
    setScoreOn(false);
    setHome(0);
    setAway(0);
    save(() => clearExactScore(matchId));
  }

  return (
    <>
      <div className="flex items-center gap-2" role="group" aria-label="Tu pronóstico">
        {(["home", "draw", "away"] as const).map((dir) => {
          const selected = direction === dir;
          return (
            <button
              key={dir}
              type="button"
              aria-pressed={selected}
              aria-label={DIR_A11Y[dir]}
              onClick={() => pickDirection(dir)}
              className={`flex-1 rounded-[10px] py-2.5 font-display text-[13px] transition ${
                selected
                  ? "bg-gradient-to-br from-[#6845E0] to-[#9B5CFF] text-white shadow-[0_6px_16px_rgba(124,92,255,0.4)]"
                  : "bg-[#1F2038] text-[#9195C2]"
              }`}
            >
              <span aria-hidden="true">{DIR_LABELS[dir]}</span>
            </button>
          );
        })}
      </div>

      <details className="group flex flex-col items-center">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-full border border-dashed border-[#3A3D5C] px-3 py-1.5 text-[11px] font-extrabold text-[#8A8FB2] [&::-webkit-details-marker]:hidden">
          {scoreOn ? `MARCADOR: ${home}-${away}` : "¿EXACTO? +5 PTS"}
          <svg
            className="transition-transform duration-200 group-open:rotate-180"
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>

        <div className="mt-2.5 w-full border-t border-dashed border-[#262844] pt-3">
          <div className="flex items-start justify-center gap-4">
            <Stepper
              label={homeShortName}
              value={scoreOn ? home : null}
              onDec={() => bump("home", -1)}
              onInc={() => bump("home", 1)}
            />
            <span className="pt-6 font-display text-lg text-[#3A3D5C]">-</span>
            <Stepper
              label={awayShortName}
              value={scoreOn ? away : null}
              onDec={() => bump("away", -1)}
              onInc={() => bump("away", 1)}
            />
          </div>

          {scoreOn && (
            <div className="mt-2.5 flex justify-center">
              <button
                type="button"
                onClick={clearScore}
                className="text-[10px] font-extrabold text-[#8A8FB2] underline underline-offset-2"
              >
                Quitar marcador
              </button>
            </div>
          )}
        </div>
      </details>
    </>
  );
}

function Stepper({
  label,
  value,
  onInc,
  onDec,
}: {
  label: string;
  value: number | null;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="max-w-[92px] truncate text-[10px] font-extrabold uppercase tracking-wide text-[#8A8FB2]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <StepButton onClick={onDec} disabled={value != null && value <= MIN} aria-label={`Un gol menos para ${label}`}>
          −
        </StepButton>
        <span className="w-8 text-center font-display text-[26px] leading-none text-[#A390FF]">{value ?? "–"}</span>
        <StepButton onClick={onInc} disabled={value != null && value >= MAX} aria-label={`Un gol más para ${label}`}>
          +
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F2038] font-display text-xl leading-none text-[#B9BCDA] transition active:scale-90 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
