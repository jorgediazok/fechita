import { Fragment } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
import "@/models/Team"; // registra el schema para poder popular favoriteTeamId
import { PhoneFrame } from "@/components/PhoneFrame";
import { TeamBadge, type BadgeTeam } from "@/components/TeamBadge";
import { BottomNav } from "@/components/BottomNav";
import {
  TIER_ORDER,
  TIER_LABELS,
  TIER_FULL_NAMES,
  getGroupStanding,
  getOrCreateActiveMembership,
  tierCanPromote,
  tierCanRelegate,
  zoneSize,
  type TierCode,
} from "@/lib/leagues";
import { closeWeekNow } from "./actions";

const isMockMode = process.env.API_FOOTBALL_MODE !== "live";

const daysFormatter = (closesAt: Date) => {
  const ms = closesAt.getTime() - Date.now();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "CIERRA HOY";
  if (days === 1) return "CIERRA MAÑANA";
  return `CIERRA EN ${days} DÍAS`;
};

export default async function LigaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  await connectToDatabase();

  const { group } = await getOrCreateActiveMembership(user._id);
  const tier = group.tier as TierCode;

  const ranked = await getGroupStanding(group._id, group.weekKey);
  const populated = await Promise.all(
    ranked.map(async (r) => {
      const memberUser = await UserModel.findById(r.membership.userId).populate(
        "favoriteTeamId",
        "name shortName logoUrl"
      );
      return { ...r, memberUser };
    })
  );

  const size = zoneSize(populated.length);
  const canPromote = tierCanPromote(tier);
  const canRelegate = tierCanRelegate(tier);
  const myIndex = populated.findIndex((r) => String(r.membership.userId) === String(user._id));

  return (
    <PhoneFrame nav={<BottomNav active="liga" />}>
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
          {TIER_ORDER.map((t) => {
            const active = t === tier;
            return (
              <div key={t} className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex items-center justify-center rounded-full ${
                    active ? "h-10 w-10 shadow-[0_6px_18px_rgba(124,92,255,0.5)]" : "h-6 w-6"
                  }`}
                  style={{ background: active ? "linear-gradient(135deg, #6845E0, #9B5CFF)" : "#23244A" }}
                >
                  <svg width={active ? 20 : 11} height={active ? 20 : 11} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l2.6 6.6L21 9.2l-5 4.4 1.5 6.9L12 17l-5.5 3.5L8 13.6 3 9.2l6.4-.6L12 2z"
                      fill={active ? "#FFFFFF" : "#6B6F94"}
                    />
                  </svg>
                </div>
                <div className={`font-display text-[9px] ${active ? "text-[#0B0C16]" : "text-[#0B0C16]/45"}`}>
                  {TIER_LABELS[t]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-5.5 -mt-3.5 flex items-center justify-between rounded-2xl bg-[#15162A] px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
        <div className="font-display text-lg text-[#7C5CFF]">{TIER_FULL_NAMES[tier].toUpperCase()}</div>
        <div className="text-[11px] font-extrabold text-[#9195C2]">{daysFormatter(group.closesAt)}</div>
      </div>

      {isMockMode && (
        <div className="mx-4.5 my-3.5 rounded-2xl border border-dashed border-[#7C5CFF]/50 p-3.5 text-sm">
          <p className="mb-2 font-bold text-[#B9BCDA]">Panel dev (ligas semanales)</p>
          <form action={closeWeekNow}>
            <button type="submit" className="rounded-xl bg-[#1F2038] px-3 py-1.5 text-xs font-bold text-[#9195C2]">
              Cerrar semana ahora
            </button>
          </form>
        </div>
      )}

      {(canPromote || canRelegate) && (
        <div className="flex items-center gap-4 px-6 pb-1 pt-2">
          {canPromote && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-sm bg-[#4FD17F]" />
              <span className="text-[11px] font-extrabold text-[#9195C2]">ASCIENDEN</span>
            </div>
          )}
          {canRelegate && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-sm bg-[#FF4D6D]" />
              <span className="text-[11px] font-extrabold text-[#9195C2]">DESCIENDEN</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5 px-5 py-2">
        {populated.map((row, i) => {
          const isMe = String(row.membership.userId) === String(user._id);
          const relegationStartsAt = populated.length - size;
          const zone = canPromote && i < size ? "up" : canRelegate && i >= relegationStartsAt ? "down" : "mid";
          const team = row.memberUser?.favoriteTeamId as BadgeTeam | undefined;

          return (
            <Fragment key={String(row.membership._id)}>
              {canRelegate && size > 0 && i === relegationStartsAt && (
                <div className="mb-1 mt-1 self-start rounded-full bg-[#2A1620] px-2.5 py-1 font-display text-[10px] text-[#FF4D6D]">
                  ZONA DE DESCENSO
                </div>
              )}
              {i === 0 && canPromote && size > 0 && (
                <div className="mb-1 self-start rounded-full bg-[#16241E] px-2.5 py-1 font-display text-[10px] text-[#4FD17F]">
                  ZONA DE ASCENSO
                </div>
              )}
              <div
                className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 ${
                  isMe ? "border-2 border-[#FF2D95] bg-[#23244A]" : zone === "up" ? "bg-[#152A20]" : zone === "down" ? "bg-[#2A1620]" : "bg-[#15162A]"
                }`}
              >
                <div
                  className={`w-5 text-center font-display text-[15px] ${
                    zone === "up" ? "text-[#4FD17F]" : zone === "down" ? "text-[#FF4D6D]" : "text-[#6B6F94]"
                  }`}
                >
                  {i + 1}
                </div>
                {team ? <TeamBadge team={team} size={26} /> : <div className="h-[26px] w-[26px]" />}
                <div className="flex-1 text-[13px] font-extrabold text-[#E4E6F7]">{row.memberUser?.name ?? "?"}</div>
                {isMe && (
                  <div className="rounded-full bg-[#FF2D95] px-2 py-0.5 font-display text-[9px] text-[#0B0C16] shadow-[0_0_14px_rgba(255,45,149,0.55)]">
                    VOS
                  </div>
                )}
                <div className="font-display text-sm">{row.points}</div>
              </div>
            </Fragment>
          );
        })}

        {populated.length === 1 && myIndex === 0 && (
          <p className="px-1 pt-2 text-xs font-bold text-[#6B6F94]">
            Sos el único en tu liga esta semana — hace falta más gente para que haya ascenso/descenso.
          </p>
        )}
      </div>
    </PhoneFrame>
  );
}
