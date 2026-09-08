"use client";

import { useOptimistic, useTransition } from "react";
import { submitDirection } from "./actions";

type Direction = "home" | "draw" | "away";

const LABELS: Record<Direction, string> = { home: "L", draw: "E", away: "V" };
const A11Y_LABELS: Record<Direction, string> = {
  home: "Gana el local",
  draw: "Empate",
  away: "Gana el visitante",
};

export function DirectionPicker({
  matchId,
  initialDirection,
}: {
  matchId: string;
  initialDirection: Direction | null;
}) {
  const [, startTransition] = useTransition();
  const [optimisticDirection, setOptimisticDirection] = useOptimistic(
    initialDirection,
    (_state, next: Direction) => next
  );

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Tu pronóstico">
      {(["home", "draw", "away"] as const).map((dir) => {
        const selected = optimisticDirection === dir;
        return (
          <button
            key={dir}
            type="button"
            aria-pressed={selected}
            aria-label={A11Y_LABELS[dir]}
            onClick={() => {
              startTransition(async () => {
                setOptimisticDirection(dir);
                await submitDirection(matchId, dir);
              });
            }}
            className={`flex-1 rounded-[10px] py-2.5 font-display text-[13px] ${
              selected
                ? "bg-gradient-to-br from-[#6845E0] to-[#9B5CFF] text-white shadow-[0_6px_16px_rgba(124,92,255,0.4)]"
                : "bg-[#1F2038] text-[#9195C2]"
            }`}
          >
            <span aria-hidden="true">{LABELS[dir]}</span>
          </button>
        );
      })}
    </div>
  );
}
