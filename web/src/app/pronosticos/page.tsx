import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import UserModel from "@/models/User";
import { isPast, isWithinDays } from "@/lib/time";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TeamBadge } from "@/components/TeamBadge";
import { BottomNav } from "@/components/BottomNav";
import { submitExactScore, runSyncNow, finishMockMatch, resetMockMatch, postponeMockMatch } from "./actions";
import { DirectionPicker } from "./DirectionPicker";
import { CompetitionTabs } from "./CompetitionTabs";
import {
  getOrCreateActiveMembership,
  getGroupStanding,
  zoneSize,
  tierCanPromote,
  tierCanRelegate,
  TIER_FULL_NAMES,
  type TierCode,
} from "@/lib/leagues";

export const metadata: Metadata = {
  title: "Pronósticos",
  robots: { index: false, follow: false },
};

const isMockMode = process.env.API_FOOTBALL_MODE !== "live";

// Una fecha se muestra recién cuando falta poco para su primer partido — el "primer partido"
// se recalcula en cada sync a partir de los kickoffAt reales, así que si se postergan
// partidos o la fecha no empieza el día habitual, el corte se mueve solo con los datos reales.
const REVEAL_WINDOW_DAYS = 3;

type PopulatedTeam = { _id: string; name: string; shortName: string; logoUrl: string };

type PopulatedMatch = {
  _id: string;
  externalId: number;
  round: string;
  kickoffAt: Date;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: PopulatedTeam;
  awayTeamId: PopulatedTeam;
};

type LeanPrediction = {
  matchId: string;
  predictedDirection: "home" | "draw" | "away";
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  points: number | null;
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export default async function PronosticosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  await connectToDatabase();

  const matches = (await MatchModel.find({})
    .sort({ kickoffAt: 1 })
    .populate("homeTeamId", "name shortName logoUrl")
    .populate("awayTeamId", "name shortName logoUrl")
    .lean()) as unknown as PopulatedMatch[];

  const predictions = (await PredictionModel.find({
    userId: user._id,
    matchId: { $in: matches.map((m) => m._id) },
  }).lean()) as unknown as LeanPrediction[];
  const predictionByMatch = new Map(predictions.map((p) => [String(p.matchId), p]));

  // Tu posición real dentro de tu grupo de ~20 de la liga semanal — no un ranking global
  // contra todos los usuarios de la app (esa idea se descartó a propósito, ver
  // docs/product-design.md: un ranking de todo el país desmotiva más de lo que engancha).
  const { group } = await getOrCreateActiveMembership(user._id);
  const tier = group.tier as TierCode;
  const ranked = await getGroupStanding(group._id, group.weekKey);
  const leaderboard = await Promise.all(
    ranked.map(async (r) => {
      const memberUser = await UserModel.findById(r.membership.userId).select("name isBot");
      return {
        id: String(r.membership.userId),
        name: memberUser?.name ?? "?",
        isBot: memberUser?.isBot ?? false,
        total: r.points,
      };
    })
  );
  const myIndex = leaderboard.findIndex((u) => u.id === String(user._id));
  const myRank = myIndex + 1;
  const totalPlayers = leaderboard.length;
  const totalPoints = leaderboard[myIndex]?.total ?? 0;
  // Solo el de arriba y el de abajo — la tabla completa vive en /liga, acá sería redundante.
  const nearby = leaderboard.slice(Math.max(0, myIndex - 1), myIndex + 2);
  const gapToNext = myIndex > 0 ? leaderboard[myIndex - 1].total - leaderboard[myIndex].total : 0;
  // Al arrancar la semana casi nadie tiene puntos: "a 0 pts del 17°" suena mal. Mensaje
  // neutro mientras no sumaste nada; competitivo recién cuando hay diferencia real.
  const rankMessageNeutral = totalPoints === 0;
  const rankMessage = rankMessageNeutral
    ? "Todavía no sumaste puntos esta semana"
    : myIndex === 0
      ? "Vas 1°, no aflojes"
      : gapToNext === 0
        ? `Empatás con el ${myRank - 1}°`
        : `Estás a ${gapToNext} pt${gapToNext === 1 ? "" : "s"} del ${myRank - 1}°`;
  const positionPct = totalPlayers > 1 ? (myIndex / (totalPlayers - 1)) * 100 : 0;
  const canPromote = tierCanPromote(tier);
  const canRelegate = tierCanRelegate(tier);
  const zone = zoneSize(totalPlayers);
  const ascentPct = canPromote && totalPlayers > 0 ? (zone / totalPlayers) * 100 : 0;
  const descentPct = canRelegate && totalPlayers > 0 ? (zone / totalPlayers) * 100 : 0;

  const matchesByRound = new Map<string, PopulatedMatch[]>();
  for (const match of matches) {
    const list = matchesByRound.get(match.round) ?? [];
    list.push(match);
    matchesByRound.set(match.round, list);
  }

  const visibleRounds = [...matchesByRound.entries()].filter(([, roundMatches]) => {
    const earliestKickoff = Math.min(...roundMatches.map((m) => new Date(m.kickoffAt).getTime()));
    return isWithinDays(earliestKickoff, REVEAL_WINDOW_DAYS);
  });

  return (
    <PhoneFrame nav={<BottomNav active="pronosticos" />}>
      <h1 className="sr-only">Pronósticos de la fecha y tu posición en la liga</h1>
      {/* hero */}
      <div
        className="px-5 pt-5 pb-8"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
        }}
      >
        <div
          className="rounded-[22px] p-4"
          style={{
            background: "rgba(11,12,22,0.42)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 34px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between text-[#F5F5FF]">
            <span className="text-[11px] font-extrabold tracking-wide">
              {user.name.toUpperCase()} · {totalPoints} PTS
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/10">
              <svg width="16" height="16" viewBox="0 -960 960 960" fill="#F5F5FF" aria-hidden="true">
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm200-500 54-18 16-54q-32-48-77-82.5T574-786l-54 38v56l160 112Zm-400 0 160-112v-56l-54-38q-54 17-99 51.5T210-652l16 54 54 18Zm-42 308 46-4 30-54-58-174-56-20-40 30q0 65 18 118.5T238-272Zm293 108q25-4 49-12l28-60-26-44H378l-26 44 28 60q24 8 49 12t51 4q26 0 51-4ZM390-360h180l56-160-146-102-144 102 54 160Zm332 88q42-50 60-103.5T800-494l-40-28-56 18-58 174 30 54 46 4Z" />
              </svg>
            </div>
          </div>

          {totalPlayers > 0 && (
            <>
              <div className="mt-2.5 flex items-center justify-center gap-3.5">
                <div className="font-display text-[44px] leading-none text-white">
                  {myRank}°
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-[12px] font-extrabold tracking-wide text-[#F5F5FF]">
                    DE {totalPlayers} JUGADORES · {TIER_FULL_NAMES[tier].toUpperCase()}
                  </div>
                  <div className="text-[11px] font-extrabold text-[#F5F5FF]/65">{totalPoints} pts esta semana</div>
                </div>
              </div>

              <div className="relative mt-3.5 h-2.5 rounded-full bg-white/12">
                {canPromote && (
                  <div className="absolute left-0 top-0 h-full rounded-l-full bg-white/18" style={{ width: `${ascentPct}%` }} />
                )}
                {canRelegate && (
                  <div className="absolute right-0 top-0 h-full rounded-r-full bg-[#FF2D95]/40" style={{ width: `${descentPct}%` }} />
                )}
                <div
                  className="absolute -top-[5px] h-5 w-5 rounded-full border-[3px] border-white bg-[#0B0C16] shadow-[0_0_0_4px_rgba(11,12,22,0.3)]"
                  style={{ left: `${positionPct}%`, transform: "translateX(-50%)" }}
                />
              </div>
              {(canPromote || canRelegate) && (
                <div className="mt-1 flex justify-between text-[9px] font-extrabold tracking-wide text-[#F5F5FF]/50">
                  <span>{canPromote ? "ZONA DE ASCENSO" : ""}</span>
                  <span>{canRelegate ? "ZONA DE DESCENSO" : ""}</span>
                </div>
              )}

              <div className="mt-3 flex justify-center">
                <div
                  className={`rounded-full px-4 py-1.5 text-[12px] font-extrabold ${
                    rankMessageNeutral ? "text-[#B9BCDA]" : "text-[#4FD17F]"
                  }`}
                  style={
                    rankMessageNeutral
                      ? { background: "rgba(245,245,255,0.10)", border: "1px solid rgba(245,245,255,0.18)" }
                      : { background: "rgba(79,209,127,0.16)", border: "1px solid rgba(79,209,127,0.4)" }
                  }
                >
                  {rankMessage}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* tu lugar en la tabla — sin sentido si nadie sumó todavía */}
      {totalPoints > 0 && nearby.length > 1 && (
        <div className="px-4.5 pt-3.5 pb-1">
          <h2 className="mb-2 text-[11px] font-extrabold tracking-wide text-[#8A8FB2]">
            TU LUGAR EN LA TABLA
          </h2>
          <div className="flex flex-col gap-1 rounded-2xl bg-[#15162A] p-1.5">
            {nearby.map((n) => {
              const isMe = n.id === String(user._id);
              const rank = leaderboard.indexOf(n) + 1;
              const inAscent = canPromote && rank <= zone;
              const inDescent = canRelegate && rank > totalPlayers - zone;
              const rankColor = inAscent ? "text-[#4FD17F]" : inDescent ? "text-[#FF4D6D]" : "text-[#8A8FB2]";
              return (
                <div
                  key={n.id}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${
                    isMe ? "bg-[#23244A] shadow-[inset_0_0_0_1.5px_#7C5CFF]" : ""
                  }`}
                >
                  <span className={`w-4 text-center font-display text-[13px] ${rankColor}`}>{rank}</span>
                  <span className="flex-1 truncate text-[12px] font-extrabold text-[#E4E6F7]">
                    {n.name}
                    {n.isBot && <span className="ml-1 text-[9px] font-extrabold text-[#8A8FB2]">BOT</span>}
                  </span>
                  {isMe && (
                    <span className="rounded-full bg-[#FF2D95] px-1.5 py-0.5 font-display text-[8px] text-[#0B0C16]">
                      VOS
                    </span>
                  )}
                  <span className="font-display text-[13px] text-[#9195C2]">{n.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* dev panel */}
      {isMockMode && (
        <div className="mx-4.5 my-3.5 rounded-2xl border border-dashed border-[#7C5CFF]/50 p-3.5 text-sm">
          <p className="mb-2 font-bold text-[#B9BCDA]">Panel dev (datos simulados de API-Football)</p>
          <form action={runSyncNow}>
            <button type="submit" className="rounded-xl bg-[#1F2038] px-3 py-1.5 text-xs font-bold text-[#9195C2]">
              Sincronizar partidos ahora
            </button>
          </form>
        </div>
      )}

      {/* competencias */}
      <CompetitionTabs>
      {/* feed */}
      <div className="flex flex-col gap-3.5 px-4.5 pb-6">
        {visibleRounds.map(([round, roundMatches]) => (
          <div key={round} className="flex flex-col gap-2.5">
            <div className="text-xs font-extrabold tracking-wide text-[#8A8FB2]">
              PENDIENTES · {round.toUpperCase()}
            </div>

            {roundMatches.map((match) => {
              const prediction = predictionByMatch.get(String(match._id));
              const kickoffPassed = isPast(match.kickoffAt);
              const finished = match.status === "finished";

              if (finished) {
                return (
                  <div key={String(match._id)} className="relative flex items-center gap-2.5 rounded-2xl bg-[#15162A] p-3.5">
                    <TeamBadge team={match.homeTeamId} size={30} />
                    <div className="flex-1 text-xs font-extrabold text-[#B9BCDA]">
                      {match.homeTeamId.shortName} vs. {match.awayTeamId.shortName}
                    </div>
                    <div className="font-display text-lg">
                      {match.homeScore}-{match.awayScore}
                    </div>
                    <TeamBadge team={match.awayTeamId} size={30} />

                    {prediction?.points != null && (
                      <div
                        className={`absolute -right-1.5 -top-3.5 flex h-11 w-11 items-center justify-center rounded-full font-display text-[11px] text-[#0B0C16] ${
                          prediction.points === 5 ? "bg-[#FF2D95]" : prediction.points === 3 ? "bg-[#4FD17F]" : "bg-[#2A2C48] text-[#8A8FB2]"
                        }`}
                      >
                        +{prediction.points}
                      </div>
                    )}

                    {isMockMode && (
                      <form action={resetMockMatch} className="absolute -bottom-2 left-3.5">
                        <input type="hidden" name="matchId" value={String(match._id)} />
                        <input type="hidden" name="externalId" value={match.externalId} />
                        <button type="submit" className="text-[10px] text-[#57628A] underline">
                          Reiniciar (dev)
                        </button>
                      </form>
                    )}
                  </div>
                );
              }

              return (
                <div key={String(match._id)} className="flex flex-col gap-2.5 rounded-2xl bg-[#15162A] p-3.5">
                  <div className="flex items-center gap-2.5">
                    <TeamBadge team={match.homeTeamId} />
                    <div className="flex-1 text-xs font-extrabold text-[#B9BCDA]">
                      {match.homeTeamId.shortName} vs. {match.awayTeamId.shortName}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-[10px] font-extrabold text-[#8A8FB2]">
                        {dateFormatter.format(new Date(match.kickoffAt))}
                      </div>
                      {match.status === "postponed" && (
                        <span className="rounded-full bg-[#FF4D6D]/15 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-[#FF4D6D]">
                          POSTERGADO
                        </span>
                      )}
                    </div>
                    <TeamBadge team={match.awayTeamId} />
                  </div>

                  {kickoffPassed ? (
                    <p className="text-xs font-bold text-[#8A8FB2]">Ya arrancó, carga cerrada.</p>
                  ) : (
                    <>
                      <DirectionPicker
                        matchId={String(match._id)}
                        initialDirection={prediction?.predictedDirection ?? null}
                      />

                      <details className="group flex flex-col items-center">
                        <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-full border border-dashed border-[#3A3D5C] px-3 py-1.5 text-[11px] font-extrabold text-[#8A8FB2] [&::-webkit-details-marker]:hidden">
                          ¿EXACTO? +5 PTS
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
                        <form action={submitExactScore} className="mt-2.5 flex items-center justify-center gap-2 border-t border-dashed border-[#262844] pt-2.5">
                          <input type="hidden" name="matchId" value={String(match._id)} />
                          <input
                            type="number"
                            name="homeScore"
                            min={0}
                            defaultValue={prediction?.predictedHomeScore ?? undefined}
                            className="h-[34px] w-[34px] rounded-[9px] bg-[#0B0C16] text-center font-display text-sm text-[#A390FF] shadow-[inset_0_0_0_1.5px_#7C5CFF]"
                          />
                          <span className="font-display text-xs text-[#3A3D5C]">-</span>
                          <input
                            type="number"
                            name="awayScore"
                            min={0}
                            defaultValue={prediction?.predictedAwayScore ?? undefined}
                            className="h-[34px] w-[34px] rounded-[9px] bg-[#0B0C16] text-center font-display text-sm text-[#A390FF] shadow-[inset_0_0_0_1.5px_#7C5CFF]"
                          />
                          <button type="submit" className="ml-1.5 rounded-lg bg-[#1F2038] px-3 py-1.5 text-[11px] font-bold text-[#9195C2]">
                            Guardar
                          </button>
                        </form>
                      </details>
                    </>
                  )}

                  {isMockMode && !finished && (
                    <form action={finishMockMatch} className="flex items-center gap-2 border-t border-dashed border-[#262844] pt-2.5 text-[10px]">
                      <input type="hidden" name="externalId" value={match.externalId} />
                      <span className="text-[#57628A]">Simular resultado final:</span>
                      <input type="number" name="resultHomeScore" min={0} defaultValue={0} className="w-10 rounded bg-[#0B0C16] px-1 text-center text-[#B9BCDA]" />
                      <span className="text-[#57628A]">-</span>
                      <input type="number" name="resultAwayScore" min={0} defaultValue={0} className="w-10 rounded bg-[#0B0C16] px-1 text-center text-[#B9BCDA]" />
                      <button type="submit" className="rounded bg-[#2A2C48] px-2 py-1 text-[#B9BCDA]">
                        Terminar
                      </button>
                    </form>
                  )}

                  {isMockMode && !finished && match.status !== "postponed" && (
                    <form action={postponeMockMatch} className="flex items-center gap-2 text-[10px]">
                      <input type="hidden" name="externalId" value={match.externalId} />
                      <button type="submit" className="text-[#57628A] underline">
                        Postergar (dev)
                      </button>
                    </form>
                  )}

                  {isMockMode && !finished && match.status === "postponed" && (
                    <form action={resetMockMatch} className="flex items-center gap-2 text-[10px]">
                      <input type="hidden" name="matchId" value={String(match._id)} />
                      <input type="hidden" name="externalId" value={match.externalId} />
                      <button type="submit" className="text-[#57628A] underline">
                        Reiniciar (dev)
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {matches.length === 0 && (
          <p className="text-sm text-[#8A8FB2]">
            Todavía no hay partidos sincronizados.
            {isMockMode && ' Usá el botón "Sincronizar partidos ahora".'}
          </p>
        )}

        {matches.length > 0 && visibleRounds.length === 0 && (
          <p className="text-sm text-[#8A8FB2]">
            La próxima fecha todavía no arranca — se habilita 3 días antes de su primer partido.
          </p>
        )}
      </div>
      </CompetitionTabs>
    </PhoneFrame>
  );
}
