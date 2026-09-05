import { Fragment } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PhoneFrame } from "@/components/PhoneFrame";

// Vista previa visual únicamente. El sistema real de ligas semanales (categorías
// Primera D -> Primera División, ascenso/descenso, grupos de ~20-25 mezclados por club)
// es la capa 3 del doc de producto y todavía no está construido — ver docs/product-design.md.
const TIERS = [
  { label: "D", active: false },
  { label: "C", active: true },
  { label: "B", active: false },
  { label: "NAC.", active: false },
  { label: "1RA.", active: false },
];

const ROWS = [
  { rank: 1, name: "Nico R.", points: 210, zone: "up" as const },
  { rank: 2, name: "Fede G.", points: 204, zone: "up" as const },
  { rank: 3, name: "Vos", points: 198, zone: "up" as const, isMe: true },
  { rank: 4, name: "Ceci M.", points: 192, zone: "up" as const },
  { rank: 5, name: "Tomi A.", points: 186, zone: "up" as const },
  { rank: 6, name: "Vale P.", points: 180, zone: "mid" as const },
  { rank: 7, name: "Santi L.", points: 174, zone: "mid" as const },
  { rank: 8, name: "Male F.", points: 168, zone: "mid" as const },
];

export default async function LigaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <PhoneFrame>
      <div className="pb-28">
      <div
        className="px-6 pt-5 pb-8"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 86%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between text-[#0B0C16]">
          <Link href="/duelos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#0B0C16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="font-display text-lg">LIGA SEMANAL</div>
          <div className="w-5" />
        </div>

        <div className="mt-3.5 flex items-end justify-between px-1">
          {TIERS.map((tier) => (
            <div key={tier.label} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex items-center justify-center rounded-full ${
                  tier.active ? "h-10 w-10 shadow-[0_6px_18px_rgba(124,92,255,0.5)]" : "h-6 w-6"
                }`}
                style={{ background: tier.active ? "linear-gradient(135deg, #6845E0, #9B5CFF)" : "#23244A" }}
              >
                <svg width={tier.active ? 20 : 11} height={tier.active ? 20 : 11} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l2.6 6.6L21 9.2l-5 4.4 1.5 6.9L12 17l-5.5 3.5L8 13.6 3 9.2l6.4-.6L12 2z"
                    fill={tier.active ? "#FFFFFF" : "#6B6F94"}
                  />
                </svg>
              </div>
              <div className={`font-display text-[9px] ${tier.active ? "text-[#0B0C16]" : "text-[#0B0C16]/45"}`}>
                {tier.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-5.5 -mt-3.5 flex items-center justify-between rounded-2xl bg-[#15162A] px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
        <div className="font-display text-lg text-[#7C5CFF]">PRIMERA C</div>
        <div className="text-[11px] font-extrabold text-[#9195C2]">CIERRA EN 2 DÍAS</div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#7C5CFF]/50 mx-4.5 my-3.5 p-3 text-xs font-bold text-[#9195C2]">
        Vista previa — el sistema real de ligas semanales (ascenso/descenso por categorías) todavía no está conectado.
      </div>

      <div className="flex items-center gap-4 px-6 pb-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-[#4FD17F]" />
          <span className="text-[11px] font-extrabold text-[#9195C2]">ASCIENDEN</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-[#FF4D6D]" />
          <span className="text-[11px] font-extrabold text-[#9195C2]">DESCIENDEN</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-5 py-2">
        {ROWS.map((row) => (
          <Fragment key={row.rank}>
            {row.rank === 6 && (
              <div key="ascenso-label" className="mb-1 mt-1 self-start rounded-full bg-[#16241E] px-2.5 py-1 font-display text-[10px] text-[#4FD17F]">
                ZONA DE ASCENSO
              </div>
            )}
            <div
              key={row.rank}
              className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 ${
                row.isMe ? "border-2 border-[#FF2D95] bg-[#23244A]" : row.zone === "up" ? "bg-[#152A20]" : "bg-[#15162A]"
              }`}
            >
              <div className={`w-5 text-center font-display text-[15px] ${row.zone === "up" ? "text-[#4FD17F]" : "text-[#6B6F94]"}`}>
                {row.rank}
              </div>
              <div className="flex-1 text-[13px] font-extrabold text-[#E4E6F7]">{row.name}</div>
              {row.isMe && (
                <div className="rounded-full bg-[#FF2D95] px-2 py-0.5 font-display text-[9px] text-[#0B0C16] shadow-[0_0_14px_rgba(255,45,149,0.55)]">
                  VOS
                </div>
              )}
              <div className="font-display text-sm">{row.points}</div>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 md:sticky md:inset-x-auto flex items-center justify-between bg-[#15162A] px-6 py-3.5 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.35)]">
        <Link href="/duelos" className="flex flex-col items-center gap-1">
          <div className="flex h-8 w-10 items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z" stroke="#6B6F94" strokeWidth="2.4" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[9px] font-extrabold text-[#6B6F94]">DUELOS</span>
        </Link>
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex h-8 w-10 items-center justify-center rounded-[10px] shadow-[0_4px_14px_rgba(124,92,255,0.45)]"
            style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 21V10M12 21V3M20 21v-7" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[9px] font-extrabold text-[#7C5CFF]">LIGA</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-60">
          <div className="flex h-8 w-10 items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#6B6F94" strokeWidth="2.4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke="#6B6F94" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[9px] font-extrabold text-[#6B6F94]">PERFIL</span>
        </div>
      </div>
      </div>
    </PhoneFrame>
  );
}
