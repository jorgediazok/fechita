import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { getCareerStats, getRoundHistory } from "@/lib/profile";
import { TIER_LABELS } from "@/lib/leagues";

export const metadata: Metadata = {
  title: "Mi carrera",
  robots: { index: false, follow: false },
};

const RESULT_PILL: Record<
  "promoted" | "relegated" | "stayed",
  { sym: string; cls: string }
> = {
  promoted: { sym: "↑", cls: "bg-[#16241E] text-[#4FD17F]" },
  relegated: { sym: "↓", cls: "bg-[#2A1620] text-[#FF4D6D]" },
  stayed: { sym: "=", cls: "bg-[#1F2038] text-[#8A8FB2]" },
};

export default async function CarreraPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  const stats = await getCareerStats(user._id);
  const history = await getRoundHistory(user._id);

  const statTiles = [
    { n: stats.totalPoints, l: "PUNTOS" },
    { n: stats.hits, l: "ACIERTOS" },
    { n: `${stats.hitRate}%`, l: "EFECTIVIDAD" },
    { n: stats.exact, l: "EXACTOS" },
    { n: stats.roundsPlayed, l: "FECHAS" },
    { n: stats.roundsWon, l: "GANADAS" },
  ];

  return (
    <PhoneFrame nav={<BottomNav active="perfil" />}>
      <div
        className="px-6 pt-5 pb-8"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between text-white">
          <Link href="/perfil" aria-label="Volver al perfil" className="rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="font-display text-lg">MI CARRERA</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="mx-4.5 mt-4">
        <p className="mb-2 text-[10px] font-extrabold tracking-wide text-[#57628A]">EN TOTAL</p>
        <div className="grid grid-cols-3 gap-2">
          {statTiles.map((s) => (
            <div key={s.l} className="rounded-xl bg-[#15162A] px-2 py-3.5 text-center">
              <p className="font-display text-xl text-[#E4E6F7]">{s.n}</p>
              <p className="mt-0.5 text-[9px] font-extrabold tracking-wide text-[#8A8FB2]">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4.5 mt-5 pb-6">
        <p className="mb-2 text-[10px] font-extrabold tracking-wide text-[#57628A]">
          FECHA POR FECHA
        </p>
        {history.length === 0 ? (
          <p className="rounded-xl bg-[#15162A] px-3.5 py-3 text-[12px] font-bold text-[#8A8FB2]">
            Todavía no cerraste ninguna fecha. Cuando termine la primera, acá vas a ver cómo
            te fue en tu grupo.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {history.map((e, i) => {
              const pill = RESULT_PILL[e.result];
              return (
                <div
                  key={`${e.roundKey}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl bg-[#15162A] px-3 py-2.5"
                >
                  <div className="w-[54px] shrink-0">
                    <p className="text-[11px] font-extrabold text-[#E4E6F7]">{e.roundKey.toUpperCase()}</p>
                    <p className="text-[8px] font-extrabold tracking-wide text-[#57628A]">
                      {TIER_LABELS[e.tier]}
                    </p>
                  </div>
                  <div className="flex flex-1 items-center gap-1.5">
                    <span className="text-[12px] font-extrabold text-[#B9BCDA]">
                      {e.rank}° / {e.total}
                    </span>
                    {e.wonRound && (
                      <svg width="12" height="12" viewBox="0 0 24 24" aria-label="Ganador de la fecha">
                        <path d="M3.6 9l3.7 2.6L12 5l4.7 6.6L20.4 9l-1.9 9.6H5.5z" fill="#F5C451" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md font-display text-[12px] ${pill.cls}`}
                  >
                    {pill.sym}
                  </span>
                  <span className="w-6 text-right font-display text-[12px] text-[#9195C2]">
                    {e.points}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
