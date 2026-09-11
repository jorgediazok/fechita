"use client";

import { useTransition } from "react";
import { RARITY } from "@/lib/badges/catalog";
import { Badge } from "./Badge";
import { SITE_NAME } from "@/lib/site";

// Primera pantalla que ve cualquier usuario nuevo en /pronosticos (Credentials u
// onboarding de Google — welcomedAt es el punto en común de los dos caminos, ver
// lib/welcome.ts). Combina en un solo momento la explicación mínima del loop central y el
// festejo de tu primera insignia, para no encadenar dos interrupciones seguidas (un modal
// de bienvenida y después, aparte, el festejo genérico de insignias). Mismo lenguaje visual
// que BadgeUnlockOverlay (glow, resorte, texto en cascada) pero sin el carrusel — acá
// siempre hay una sola insignia.
export function WelcomeOverlay({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const r = RARITY.bronce;

  return (
    <div
      className="no-scrollbar absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-10 text-center"
      style={{ background: "linear-gradient(165deg, #14102b 0%, #0b0c16 60%)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Bienvenido a ${SITE_NAME}`}
    >
      <style>{`
        @keyframes wo-pop { 0% { transform: scale(0.3); opacity: 0; } 62% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes wo-fade { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes wo-glow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.06); } }
        .wo-pop { animation: wo-pop 0.62s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .wo-fade { animation: wo-fade 0.5s ease-out both; }
        .wo-glow { animation: wo-glow 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .wo-pop, .wo-fade, .wo-glow { animation: none !important; }
        }
      `}</style>

      <div className="wo-fade flex flex-shrink-0 flex-col items-center" style={{ animationDelay: "0ms" }}>
        <p className="text-[11px] font-extrabold tracking-[0.18em] text-[#9195C2]">
          BIENVENIDO A {SITE_NAME.toUpperCase()}
        </p>
        <h1 className="mt-1 max-w-[26ch] font-display text-[22px] leading-tight text-white">
          Pronosticá la fecha, subí de categoría
        </h1>
      </div>

      <ul className="wo-fade flex w-full max-w-[300px] flex-col gap-2.5 text-left" style={{ animationDelay: "80ms" }}>
        {[
          "Elegís quién gana cada partido: local, empate o visitante.",
          "Acertás y sumás puntos — más si además clavás el resultado exacto.",
          "Competís fecha a fecha en un grupo de tu categoría: subís o bajás según cómo te vaya.",
        ].map((line, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px] font-semibold leading-snug text-[#E4E6F7]">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#1F2038] font-display text-[11px] text-[#C9B8FF]">
              {i + 1}
            </span>
            {line}
          </li>
        ))}
      </ul>

      <div className="relative flex flex-shrink-0 flex-col items-center">
        <div className="relative flex h-[130px] w-[130px] items-center justify-center">
          <div
            className="wo-glow absolute inset-[8%] rounded-full"
            style={{ background: `radial-gradient(circle, ${r.glow}, transparent 66%)` }}
          />
          <div className="wo-pop relative" style={{ animationDelay: "160ms" }}>
            <Badge badgeId="bienvenida" size={92} />
          </div>
        </div>
        <p className="wo-fade mt-2 text-[11px] font-bold text-[#8A8FB2]" style={{ animationDelay: "260ms" }}>
          Ganaste tu primera insignia — te van a ir apareciendo más a medida que juegues.
        </p>
      </div>

      <div className="wo-fade relative flex flex-shrink-0 flex-col items-center gap-2" style={{ animationDelay: "340ms" }}>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => action())}
          className="rounded-full px-9 py-3.5 font-display text-base text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
        >
          {pending ? "…" : "DALE, VAMOS"}
        </button>
        <a href="/reglas" className="text-[12px] font-bold text-[#8A8FB2] underline underline-offset-2">
          ¿Cómo se juega, en detalle?
        </a>
      </div>
    </div>
  );
}
