"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { RARITY, type BadgeRarity } from "@/lib/badges/catalog";
import { Badge } from "./Badge";

export type OverlayBadge = {
  id: string;
  name: string;
  rarity: BadgeRarity;
  flavor: string;
  criterio: string;
};

const PALETTES: Record<BadgeRarity, string[]> = {
  bronce: ["#f0a56e", "#a75e38", "#ffd9b0", "#7c5cff"],
  plata: ["#e4e9f2", "#8a93a6", "#c7cedd", "#7c5cff"],
  oro: ["#ffe08a", "#f5c451", "#c99628", "#fff4d6"],
  marca: ["#7c5cff", "#ff2d95", "#9b5cff", "#ff4fc3", "#ffde8a"],
};

// Festejo estilo Duolingo para las insignias recién ganadas: fondo oscurecido, rayos,
// glow pulsante, el medallón entra con un resorte, y confeti en canvas. Si hay varias se
// muestran de a una. Al cerrar, marca todas como vistas (server action `action`).
export function BadgeUnlockOverlay({
  badges,
  action,
}: {
  badges: OverlayBadge[];
  action: () => Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const badge = badges[index];
  const isLast = index >= badges.length - 1;
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!badge || reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = PALETTES[badge.rarity];
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.4;
    type P = {
      x: number; y: number; vx: number; vy: number; g: number; size: number;
      rot: number; vrot: number; color: string; life: number; decay: number; rect: boolean;
    };
    const parts: P[] = [];
    for (let i = 0; i < 90; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 8;
      parts.push({
        x: cx + (Math.random() - 0.5) * 36,
        y: cy + (Math.random() - 0.5) * 26,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 4,
        g: 0.16 + Math.random() * 0.1,
        size: 4 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        rect: Math.random() < 0.5,
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx *= 0.99;
        p.vy = p.vy * 0.99 + p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.life -= p.decay;
        if (p.life <= 0 || p.y > canvas.height + 40) {
          parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.rect) ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (parts.length > 0) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [index, badge, reduce]);

  if (!badge) return null;

  const r = RARITY[badge.rarity];

  function next() {
    if (isLast) startTransition(() => action());
    else setIndex((i) => i + 1);
  }

  return (
    <div
      className="no-scrollbar absolute inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-y-auto px-6 py-10 text-center"
      style={{ background: "linear-gradient(165deg, #14102b 0%, #0b0c16 60%)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Insignia desbloqueada: ${badge.name}`}
    >
      <style>{`
        @keyframes bu-pop { 0% { transform: scale(0.3); opacity: 0; } 62% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes bu-fade { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bu-spin { to { transform: rotate(360deg); } }
        @keyframes bu-glow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.06); } }
        .bu-pop { animation: bu-pop 0.62s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .bu-fade { animation: bu-fade 0.5s ease-out both; }
        .bu-spin { animation: bu-spin 16s linear infinite; }
        .bu-glow { animation: bu-glow 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bu-pop, .bu-fade, .bu-spin, .bu-glow { animation: none !important; }
        }
      `}</style>

      <div className="relative flex flex-shrink-0 flex-col items-center">
        <div className="relative flex h-[220px] w-[220px] items-center justify-center">
          <div
            className="bu-spin absolute inset-[-6%] rounded-full"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.14) 0deg 5deg, transparent 5deg 17deg)",
              WebkitMaskImage:
                "radial-gradient(circle, #000 26%, rgba(0,0,0,0.5) 46%, transparent 72%)",
              maskImage:
                "radial-gradient(circle, #000 26%, rgba(0,0,0,0.5) 46%, transparent 72%)",
            }}
          />
          <div
            className="bu-glow absolute inset-[8%] rounded-full"
            style={{ background: `radial-gradient(circle, ${r.glow}, transparent 66%)` }}
          />
          <div className="bu-pop relative">
            <Badge badgeId={badge.id} rarity={badge.rarity} size={150} />
          </div>
        </div>

        <div className="bu-fade mt-5 text-[11px] font-extrabold tracking-[0.18em] text-[#9195C2]" style={{ animationDelay: "120ms" }}>
          INSIGNIA DESBLOQUEADA
        </div>
        <div className="bu-fade font-display text-[30px] leading-tight text-white" style={{ animationDelay: "180ms" }}>
          {badge.name}
        </div>
        <div
          className="bu-fade mt-2 inline-flex items-center gap-2 rounded-full border border-[#262844] bg-[#101227] px-3 py-1 text-[10px] font-extrabold tracking-wide text-[#9195C2]"
          style={{ animationDelay: "230ms" }}
        >
          <i className="inline-block h-3 w-2.5" style={{ background: r.ring, clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }} />
          {r.label.toUpperCase()}
        </div>
        <p className="bu-fade mt-4 max-w-[30ch] text-sm font-semibold text-[#E4E6F7]" style={{ animationDelay: "290ms" }}>
          {badge.flavor}
        </p>
        <p className="bu-fade mt-2 text-[11px] font-bold text-[#8A8FB2]" style={{ animationDelay: "340ms" }}>
          {badge.criterio}
        </p>
      </div>

      <div className="bu-fade relative flex flex-shrink-0 items-center gap-3" style={{ animationDelay: "420ms" }}>
        {badges.length > 1 && (
          <span className="text-[11px] font-extrabold text-[#8A8FB2]">
            {index + 1} / {badges.length}
          </span>
        )}
        <button
          type="button"
          onClick={next}
          disabled={pending}
          className="rounded-full px-8 py-3 font-display text-sm text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF)" }}
        >
          {isLast ? "DALE" : "SIGUIENTE"}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}
