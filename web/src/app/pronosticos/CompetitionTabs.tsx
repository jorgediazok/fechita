"use client";

import { useState, type ReactNode } from "react";

// Solo la Liga Profesional tiene fixtures cargados (ver docs/product-design.md — el resto
// del alcance está definido pero todavía no sincronizado). Las otras pestañas muestran una
// nota con el calendario real del torneo en vez de un tab vacío.
type Comp = {
  key: string;
  label: string;
  blurb?: string;
};

const COMPETITIONS: Comp[] = [
  { key: "liga", label: "LIGA" },
  {
    key: "copa-argentina",
    label: "COPA ARGENTINA",
    blurb:
      "La Copa Argentina se juega por eliminación directa durante casi todo el año, en paralelo al torneo local. Todavía no cargamos estos cruces — se suman más adelante.",
  },
  {
    key: "sudamericana",
    label: "SUDAMERICANA",
    blurb:
      "La Copa Sudamericana arranca en marzo con la fase de grupos y define al campeón en noviembre. Todavía no está disponible para pronosticar acá.",
  },
  {
    key: "libertadores",
    label: "LIBERTADORES",
    blurb:
      "La fase de grupos de la Libertadores empieza en abril y la final se juega a un partido en noviembre. Todavía no está disponible para pronosticar acá.",
  },
];

export function CompetitionTabs({ children }: { children: ReactNode }) {
  const [active, setActive] = useState("liga");
  const current = COMPETITIONS.find((c) => c.key === active) ?? COMPETITIONS[0];

  return (
    <>
      <div
        className="flex gap-1.5 overflow-x-auto px-4.5 pb-2 pt-1"
        role="group"
        aria-label="Competencia"
      >
        {COMPETITIONS.map((c) => {
          const selected = c.key === active;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(c.key)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wide transition-colors ${
                selected
                  ? "bg-gradient-to-br from-[#6845E0] to-[#9B5CFF] text-white"
                  : "bg-[#1F2038] text-[#9195C2]"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {active === "liga" ? (
        children
      ) : (
        <div className="mx-4.5 my-4 flex flex-col items-center gap-3 rounded-2xl bg-[#15162A] px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F2038]">
            <svg width="22" height="22" viewBox="0 -960 960 960" fill="#A390FF" aria-hidden="true">
              <path d="M480-120q-33 0-56.5-23.5T400-200q0-33 23.5-56.5T480-280q33 0 56.5 23.5T560-200q0 33-23.5 56.5T480-120Zm-80-240v-440h160v440H400Z" />
            </svg>
          </div>
          <h2 className="font-display text-base text-[#E4E6F7]">{current.label}</h2>
          <p className="max-w-[260px] text-[12px] font-bold leading-relaxed text-[#9195C2]">{current.blurb}</p>
        </div>
      )}
    </>
  );
}
