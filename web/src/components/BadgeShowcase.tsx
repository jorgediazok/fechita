"use client";

import { useEffect, useState } from "react";
import { GROUP_LABELS, RARITY, type BadgeGroup, type BadgeRarity } from "@/lib/badges/catalog";
import { Badge } from "./Badge";

export type ShowcaseBadge = {
  id: string;
  name: string;
  rarity: BadgeRarity;
  group: BadgeGroup;
  criterio: string;
  flavor: string;
  earned: boolean;
  earnedAt: string | null;
};

const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

const dateFmt = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" });

export function BadgeShowcase({
  badges,
  earnedCount,
  total,
}: {
  badges: ShowcaseBadge[];
  earnedCount: number;
  total: number;
}) {
  const [selected, setSelected] = useState<ShowcaseBadge | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  // Agrupar respetando el orden del catálogo.
  const groups: { group: BadgeGroup; items: ShowcaseBadge[] }[] = [];
  for (const b of badges) {
    let g = groups.find((x) => x.group === b.group);
    if (!g) {
      g = { group: b.group, items: [] };
      groups.push(g);
    }
    g.items.push(b);
  }

  const r = selected ? RARITY[selected.rarity] : null;

  return (
    <section className="mx-4.5 mt-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-sm tracking-wide text-[#E4E6F7]">INSIGNIAS</h2>
        <span className="text-[11px] font-extrabold text-[#8A8FB2]">
          {earnedCount} / {total}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {groups.map(({ group, items }) => (
          <div key={group}>
            <p className="mb-2 text-[10px] font-extrabold tracking-wide text-[#57628A]">
              {GROUP_LABELS[group].toUpperCase()}
            </p>
            <div className="grid grid-cols-4 gap-x-2 gap-y-3">
              {items.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelected(b)}
                  className="flex flex-col items-center gap-1.5 rounded-xl py-1 transition-transform active:scale-95"
                  aria-label={`${b.name} — ${b.earned ? "conseguida" : "bloqueada"}. Ver cómo se consigue`}
                >
                  <Badge badgeId={b.id} size={62} locked={!b.earned} />
                  <span
                    className={`text-center text-[9px] font-bold leading-tight ${
                      b.earned ? "text-[#B9BCDA]" : "text-[#4A4E71]"
                    }`}
                  >
                    {b.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && r && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 px-4 pb-4 pt-10 md:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="w-full max-w-[400px] rounded-3xl border border-[#262844] bg-[#15162A] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <Badge badgeId={selected.id} size={78} locked={!selected.earned} />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="font-display text-lg leading-tight text-[#E4E6F7]">{selected.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#262844] bg-[#101227] px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-[#9195C2]">
                    <i className="inline-block h-2.5 w-2" style={{ background: r.ring, clipPath: HEX }} />
                    {r.label.toUpperCase()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide ${
                      selected.earned
                        ? "bg-[#16241E] text-[#4FD17F]"
                        : "bg-[#1F2038] text-[#8A8FB2]"
                    }`}
                  >
                    {selected.earned ? "CONSEGUIDA" : "BLOQUEADA"}
                  </span>
                </div>
                {selected.earned && selected.earnedAt && (
                  <p className="mt-1 text-[10px] font-bold text-[#8A8FB2]">
                    El {dateFmt.format(new Date(selected.earnedAt))}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0B0C16] p-3.5">
              <p className="text-[10px] font-extrabold tracking-wide text-[#57628A]">CÓMO SE CONSIGUE</p>
              <p className="mt-1 text-[13px] font-bold text-[#E4E6F7]">{selected.criterio}</p>
            </div>

            <p className="mt-3 text-[12px] font-semibold italic leading-relaxed text-[#9195C2]">
              “{selected.flavor}”
            </p>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-5 w-full rounded-2xl bg-[#1F2038] py-3 text-sm font-bold text-[#9195C2]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
