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
  getPendingLeagueResult,
  getRoundProgress,
  tierCanPromote,
  tierCanRelegate,
  zoneSize,
  type TierCode,
} from "@/lib/leagues";
import { closeRoundNow, acknowledgeResult } from "./actions";
import { isMockMode as runningInMockMode } from "@/lib/fixtures/source";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { ShareButton } from "@/components/ShareButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liga",
  robots: { index: false, follow: false },
};

const isMockMode = runningInMockMode();

export default async function LigaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  await connectToDatabase();

  const { group } = await getOrCreateActiveMembership(user._id);
  const tier = group.tier as TierCode;

  // Independientes entre sí una vez que tenemos el grupo — en serie eran ~10 round-trips.
  const [pendingResult, roundProgress, ranked] = await Promise.all([
    getPendingLeagueResult(user._id),
    getRoundProgress(group.roundKey),
    getGroupStanding(group._id),
  ]);

  const memberUsers = await UserModel.find({
    _id: { $in: ranked.map((r) => r.membership.userId) },
  }).populate("favoriteTeamId", "name shortName logoUrl");
  const memberById = new Map(memberUsers.map((u) => [String(u._id), u]));
  const populated = ranked.map((r) => ({
    ...r,
    memberUser: memberById.get(String(r.membership.userId)) ?? null,
  }));

  const size = zoneSize(populated.length);
  const canPromote = tierCanPromote(tier);
  const canRelegate = tierCanRelegate(tier);
  const myIndex = populated.findIndex((r) => String(r.membership.userId) === String(user._id));

  const promoted = pendingResult?.result === "promoted";
  const relegated = pendingResult?.result === "relegated";
  const stayed = pendingResult?.result === "stayed";
  const finalPosition = pendingResult
    ? pendingResult.standings.findIndex((s) => s.userId === String(user._id)) + 1
    : 0;
  const shareText = pendingResult
    ? promoted
      ? `¡Ascendí a ${TIER_FULL_NAMES[tier]} en ${SITE_NAME}! Terminé la ${pendingResult.roundKey} con ${pendingResult.points} pts.`
      : relegated
        ? `Bajé a ${TIER_FULL_NAMES[tier]} en ${SITE_NAME} — la ${pendingResult.roundKey} no fue la mía (${pendingResult.points} pts). La próxima remonto.`
        : `Terminé ${finalPosition}° en ${TIER_FULL_NAMES[tier]} con ${pendingResult.points} pts en la ${pendingResult.roundKey} de ${SITE_NAME}.`
    : "";
  // "stayed" (no ascendiste ni descendiste) usa el violeta de marca en vez del dorado de
  // ascenso o el rojo de descenso — es una noticia neutra, no buena ni mala.
  const accentColor = promoted ? "#FFD75E" : relegated ? "#FF4D6D" : "#A390FF";
  const accentGlow = promoted
    ? "rgba(255,255,255,0.55)"
    : relegated
      ? "rgba(255,77,109,0.4)"
      : "rgba(124,92,255,0.35)";
  const accentBg = promoted ? "rgba(255,255,255,0.2)" : relegated ? "rgba(255,77,109,0.16)" : "rgba(124,92,255,0.16)";
  const accentShadow = promoted
    ? "0 0 50px rgba(255,255,255,0.4)"
    : relegated
      ? "0 0 40px rgba(255,77,109,0.35)"
      : "0 0 40px rgba(124,92,255,0.35)";

  return (
    <PhoneFrame
      nav={<BottomNav active="liga" />}
      overlay={
        pendingResult && (
          <div
            className="no-scrollbar absolute inset-0 z-50 flex flex-col items-center overflow-y-auto px-6 pb-8 pt-10 text-center"
            style={{
              background: promoted
                ? "linear-gradient(160deg, #6845E0 0%, #9B5CFF 50%, #FF4FC3 100%)"
                : "#0B0C16",
            }}
          >
            <style>{`
              @keyframes lg-pop {
                0% { transform: scale(0.3); opacity: 0; }
                65% { transform: scale(1.12); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes lg-fade-up {
                from { transform: translateY(14px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              @keyframes lg-glow-pulse {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 0.9; transform: scale(1.08); }
              }
              .lg-anim-pop { animation: lg-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
              .lg-anim-fade { animation: lg-fade-up 0.5s ease-out both; }
              .lg-anim-glow { animation: lg-glow-pulse 2.4s ease-in-out infinite; }
            `}</style>

            {relegated && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 26%, rgba(255,77,109,0.22), transparent 65%)" }}
              />
            )}

            <div className="relative flex flex-shrink-0 flex-col items-center gap-5">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <div
                  className="lg-anim-glow absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${accentGlow}, transparent 70%)` }}
                />
                <div
                  className="lg-anim-pop relative flex h-24 w-24 items-center justify-center rounded-full"
                  style={{ background: accentBg, boxShadow: accentShadow }}
                >
                  {stayed ? (
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="46" height="46" viewBox={promoted ? "0 0 576 512" : "0 0 512 512"} fill={accentColor}>
                      {promoted ? (
                        <path d="M400 0L176 0c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8L24 64C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9L192 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l192 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-26.1 0C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24L446.4 64c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112l84.4 0c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6l84.4 0c-5.1 66.3-31.1 111.2-63 142.3z" />
                      ) : (
                        <path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zm240 80c0-8.8 7.2-16 16-16c45 0 85.6 20.5 115.7 53.1c6 6.5 5.6 16.6-.9 22.6s-16.6 5.6-22.6-.9c-25-27.1-57.4-42.9-92.3-42.9c-8.8 0-16-7.2-16-16zm-80 80c-26.5 0-48-21-48-47c0-20 28.6-60.4 41.6-77.7c3.2-4.4 9.6-4.4 12.8 0C179.6 308.6 208 349 208 369c0 26-21.5 47-48 47zM367.6 208a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                      )}
                    </svg>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div
                  className="lg-anim-fade font-display text-[32px] leading-none"
                  style={{
                    color: promoted ? "#FFFFFF" : relegated ? "#FF4D6D" : "#E4E6F7",
                    animationDelay: "150ms",
                  }}
                >
                  {promoted ? "¡ASCENDISTE!" : relegated ? "DESCENDISTE" : `TERMINASTE ${finalPosition}°`}
                </div>
                <div
                  className="lg-anim-fade text-sm font-extrabold"
                  style={{ color: promoted ? "rgba(255,255,255,0.85)" : "#9195C2", animationDelay: "220ms" }}
                >
                  {stayed
                    ? `Seguís en ${TIER_FULL_NAMES[tier]} · ${pendingResult.points} pts`
                    : <>De {TIER_FULL_NAMES[pendingResult.oldTier]} a {TIER_FULL_NAMES[tier]}</>}
                </div>
              </div>
            </div>

            <div
              className="lg-anim-fade relative mt-6 w-full max-w-[340px] flex-1 rounded-2xl p-3.5"
              style={{
                background: promoted ? "rgba(11,12,22,0.35)" : "#15162A",
                backdropFilter: promoted ? "blur(8px)" : undefined,
                animationDelay: "290ms",
              }}
            >
              <div
                className="mb-2.5 px-0.5 text-left text-[10px] font-extrabold tracking-wide"
                style={{ color: promoted ? "rgba(255,255,255,0.7)" : "#8A8FB2" }}
              >
                TABLA FINAL · {pendingResult.roundKey.toUpperCase()} · {TIER_FULL_NAMES[pendingResult.oldTier].toUpperCase()}
              </div>
              <div className="flex flex-col gap-1.5">
                {pendingResult.standings.map((row, i) => {
                  const isMe = row.userId === String(user._id);
                  const zoneColor =
                    row.result === "promoted" ? "#4FD17F" : row.result === "relegated" ? "#FF4D6D" : "#8A8FB2";
                  return (
                    <div
                      key={row.userId}
                      className="lg-anim-fade flex items-center gap-2.5 rounded-xl px-2.5 py-2"
                      style={{
                        background: isMe ? "rgba(124,92,255,0.18)" : "rgba(255,255,255,0.04)",
                        boxShadow: isMe ? "inset 0 0 0 1.5px #7C5CFF" : undefined,
                        animationDelay: `${380 + i * 55}ms`,
                      }}
                    >
                      <span className="w-4 text-center text-[12px] font-extrabold" style={{ color: zoneColor }}>
                        {i + 1}
                      </span>
                      {row.team ? (
                        <TeamBadge team={row.team} size={22} />
                      ) : (
                        <div className="h-[22px] w-[22px]" />
                      )}
                      <span
                        className="flex-1 truncate text-left text-[12px] font-extrabold"
                        style={{ color: promoted ? "#FFFFFF" : "#E4E6F7" }}
                      >
                        {row.name}
                        {row.isBot && <span className="ml-1 text-[9px] font-extrabold text-[#8A8FB2]">BOT</span>}
                      </span>
                      <span className="text-[12px] font-extrabold" style={{ color: zoneColor }}>
                        {row.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg-anim-fade relative mt-6 w-full max-w-[340px] flex-shrink-0" style={{ animationDelay: "560ms" }}>
              <ShareButton text={shareText} url={SITE_URL} label="Compartir resultado" />
            </div>

            <form action={acknowledgeResult} className="lg-anim-fade relative mt-2.5 flex-shrink-0" style={{ animationDelay: "620ms" }}>
              <input type="hidden" name="membershipId" value={pendingResult.membershipId} />
              <button
                type="submit"
                className="rounded-full px-8 py-3 font-display text-sm text-white"
                style={{
                  background: promoted ? "#0B0C16" : "linear-gradient(135deg, #6845E0, #9B5CFF)",
                }}
              >
                {promoted ? "SEGUIR JUGANDO" : relegated ? "DALE, VAMOS DE NUEVO" : "DALE, SEGUIMOS"}
              </button>
            </form>
          </div>
        )
      }
    >
      <div
        className="px-6 pt-5 pb-12"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 86%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between text-white">
          <Link href="/pronosticos" aria-label="Volver a pronósticos" className="rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="font-display text-lg">LIGA</h1>
          <Link href="/reglas" aria-label="Cómo se juega" className="rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="2" />
              <path
                d="M9.5 9.2a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.4 1.1-1.4 2v.3"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="11.7" cy="17" r="1.2" fill="#FFFFFF" />
            </svg>
          </Link>
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
                      fill={active ? "#FFFFFF" : "#8A8FB2"}
                    />
                  </svg>
                </div>
                <div className={`font-display text-[9px] ${active ? "text-white" : "text-white/45"}`}>
                  {TIER_LABELS[t]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-5.5 mt-4 flex items-center justify-between rounded-2xl bg-[#15162A] px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
        <div className="font-display text-lg text-[#7C5CFF]">{TIER_FULL_NAMES[tier].toUpperCase()}</div>
        <div className="text-right">
          <div className="font-display text-sm text-[#E4E6F7]">{group.roundKey.toUpperCase()}</div>
          <div className="text-[10px] font-extrabold text-[#9195C2]">
            {roundProgress.complete
              ? "FECHA TERMINADA"
              : roundProgress.done > 0
                ? `${roundProgress.done}/${roundProgress.total} JUGADOS`
                : "CIERRA AL TERMINAR LA FECHA"}
          </div>
        </div>
      </div>

      <p className="mx-5.5 mt-2.5 text-[11px] font-bold leading-relaxed text-[#8A8FB2]">
        Cada fecha, los mejores de tu grupo suben de categoría y los últimos bajan. El #1 es el
        ganador de la fecha.
      </p>

      {isMockMode && (
        <div className="mx-4.5 my-3.5 rounded-2xl border border-dashed border-[#7C5CFF]/50 p-3.5 text-sm">
          <p className="mb-2 font-bold text-[#B9BCDA]">Panel dev (ligas por fecha)</p>
          <form action={closeRoundNow}>
            <button type="submit" className="rounded-xl bg-[#1F2038] px-3 py-1.5 text-xs font-bold text-[#9195C2]">
              Cerrar fecha ahora
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
                    zone === "up" ? "text-[#4FD17F]" : zone === "down" ? "text-[#FF4D6D]" : "text-[#8A8FB2]"
                  }`}
                >
                  {i + 1}
                </div>
                {team ? <TeamBadge team={team} size={26} /> : <div className="h-[26px] w-[26px]" />}
                <div className="flex flex-1 items-center gap-1.5">
                  <span className="text-[13px] font-extrabold text-[#E4E6F7]">{row.memberUser?.name ?? "?"}</span>
                  {row.memberUser?.isBot && (
                    <span className="rounded bg-[#2A2C48] px-1.5 py-0.5 font-display text-[8px] tracking-wide text-[#8A8FB2]">
                      BOT
                    </span>
                  )}
                </div>
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
          <p className="px-1 pt-2 text-xs font-bold text-[#8A8FB2]">
            Sos el único en tu liga esta fecha — hace falta más gente para que haya ascenso/descenso.
          </p>
        )}
      </div>
    </PhoneFrame>
  );
}
