import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import UserModel from "@/models/User";
import { isWithinDays, isWithinPastDays } from "@/lib/time";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TeamBadge } from "@/components/TeamBadge";
import { BottomNav } from "@/components/BottomNav";
import {
  runSyncNow,
  finishMockMatch,
  resetMockMatch,
  postponeMockMatch,
  dismissBadges,
  dismissStreak,
} from "./actions";
import { MatchPredictor } from "./MatchPredictor";
import { RoundProgress } from "./RoundProgress";
import { PushNudge } from "@/components/PushClient";
import { NotificationBell } from "@/components/NotificationBell";
import { StreakInfo } from "@/components/StreakInfo";
import { BadgeUnlockOverlay } from "@/components/BadgeUnlockOverlay";
import { StreakCelebration } from "@/components/StreakCelebration";
import { evaluateBadgesForUser, getUnseenBadges } from "@/lib/badges";
import { currentRoundStreak } from "@/lib/badges/award";
import { getPendingStreak } from "@/lib/profile";
import { CompetitionTabs } from "./CompetitionTabs";
import { isMockMode as runningInMockMode, isReplayMode } from "@/lib/fixtures/source";
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

const isMockMode = runningInMockMode();
const replayMode = isReplayMode();

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

export default async function PronosticosPage({
  searchParams,
}: {
  searchParams: Promise<{ festejoRacha?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  // Preview dev (mock): forzar el festejo de racha desde la URL para poder verlo sin cerrar
  // una fecha. Ej: /pronosticos?festejoRacha=4
  const previewStreak =
    isMockMode && Number((await searchParams).festejoRacha) > 0
      ? Number((await searchParams).festejoRacha)
      : null;

  await connectToDatabase();

  // Todo lo de abajo es independiente entre sí — se pedía en serie (~35 round-trips a Atlas,
  // ~3 s). En paralelo, la ruta crítica pasa a ser la cadena de liga (membresía → tabla).
  const [matches, predictions, leagueData, unseenBadges, streak] = await Promise.all([
    MatchModel.find({})
      .sort({ kickoffAt: 1 })
      .populate("homeTeamId", "name shortName logoUrl")
      .populate("awayTeamId", "name shortName logoUrl")
      .lean() as unknown as Promise<PopulatedMatch[]>,

    PredictionModel.find({ userId: user._id }).lean() as unknown as Promise<LeanPrediction[]>,

    // Tu posición real dentro de tu grupo de ~24 de la liga de la fecha (no un ranking global,
    // ver docs/product-design.md). membresía → tabla → nombres de los miembros.
    (async () => {
      const { group } = await getOrCreateActiveMembership(user._id);
      const ranked = await getGroupStanding(group._id);
      const members = (await UserModel.find({ _id: { $in: ranked.map((r) => r.membership.userId) } })
        .select("name isBot")
        .lean()) as unknown as { _id: unknown; name: string; isBot?: boolean }[];
      return { group, ranked, members };
    })(),

    // Recalcular insignias al entrar (además de en el sync y el cierre de fecha) garantiza que
    // el festejo aparezca sí o sí la próxima vez que el usuario abre la app.
    (async () => {
      await evaluateBadgesForUser(user._id);
      return (await getUnseenBadges(user._id)).map((b) => ({
        id: b.id,
        name: b.name,
        rarity: b.rarity,
        flavor: b.flavor,
        criterio: b.criterio,
      }));
    })(),

    // Racha de fechas (misma que las insignias de fuego).
    currentRoundStreak(user._id),
  ]);

  const { group, ranked, members: memberUsers } = leagueData;
  const tier = group.tier as TierCode;
  const predictionByMatch = new Map(predictions.map((p) => [String(p.matchId), p]));

  // El festejo de racha cede el paso al de insignias — si hay una insignia sin ver, va después.
  const pendingStreak = unseenBadges.length === 0 ? await getPendingStreak(user._id) : null;

  // "En juego": tenés racha pero todavía no cargaste los 3 pronósticos mínimos de la fecha
  // en curso que hacen falta para que cuente (STREAK_MIN_PREDICTIONS en lib/badges/award).
  const currentRoundMatches = matches.filter((m) => m.round === group.roundKey);
  const predictedInRound = currentRoundMatches.filter((m) =>
    predictionByMatch.has(String(m._id))
  ).length;
  const streakAtRisk =
    streak > 0 && predictedInRound < Math.min(3, currentRoundMatches.length);
  const memberById = new Map(memberUsers.map((u) => [String(u._id), u]));
  const leaderboard = ranked.map((r) => {
    const memberUser = memberById.get(String(r.membership.userId));
    return {
      id: String(r.membership.userId),
      name: memberUser?.name ?? "?",
      isBot: memberUser?.isBot ?? false,
      total: r.points,
    };
  });
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

  // Una fecha se muestra si su primer partido está dentro de la ventana de revelado y su
  // último partido no terminó hace más de 2 días — así la fecha recién jugada queda un rato
  // para ver cómo te fue, y después desaparece (con datos reales el feed acumularía todas
  // las fechas pasadas si no).
  const visibleRounds = [...matchesByRound.entries()].filter(([, roundMatches]) => {
    const kickoffs = roundMatches.map((m) => m.kickoffAt);
    const earliest = kickoffs.reduce((a, b) => (a < b ? a : b));
    const latest = kickoffs.reduce((a, b) => (a > b ? a : b));
    return isWithinDays(earliest, REVEAL_WINDOW_DAYS) && isWithinPastDays(latest, 2);
  });

  return (
    <PhoneFrame
      nav={<BottomNav active="pronosticos" />}
      overlay={
        previewStreak ? (
          <StreakCelebration streak={previewStreak} action={dismissStreak} />
        ) : unseenBadges.length > 0 ? (
          <BadgeUnlockOverlay badges={unseenBadges} action={dismissBadges} />
        ) : pendingStreak ? (
          <StreakCelebration streak={pendingStreak.streak} action={dismissStreak} />
        ) : null
      }
    >
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
          <div className="flex items-center justify-between gap-2 text-[#F5F5FF]">
            <StreakInfo streak={streak} atRisk={streakAtRisk} />
            <NotificationBell />
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
                  className="absolute -top-[8px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[15px] leading-none shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
                  style={{ left: `${positionPct}%`, transform: "translateX(-50%)" }}
                  aria-hidden="true"
                >
                  ⚽
                </div>
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

      {/* racha en juego: nudge para volver y no cortarla */}
      {streakAtRisk && (
        <div className="mx-4.5 mt-3 flex items-center gap-2.5 rounded-2xl border border-[#FF7A3D]/40 bg-[#211308] px-3.5 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
            <path
              d="M12 2c1.1 3.1-1.6 4.7-1.6 7.4 0 1.4 1 2.3 1 2.3s2.7-2.1 2.2-4.8c2.1 2.1 3.7 4.8 3.7 7.8A5.3 5.3 0 0 1 6.7 15C6.7 10.3 11 8.1 12 2z"
              fill="#FF9D5C"
            />
          </svg>
          <p className="text-[12px] font-bold leading-snug text-[#FFCBA6]">
            Tu racha de {streak} {streak === 1 ? "fecha" : "fechas"} está en juego — cargá tus
            pronósticos de esta fecha para no cortarla.
          </p>
        </div>
      )}

      <PushNudge />

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

      {/* replay: la temporada 2024 corrida al presente, no fútbol en vivo */}
      {replayMode && (
        <p className="mx-4.5 mt-3.5 rounded-xl bg-[#15162A] px-3.5 py-2.5 text-[12px] font-bold leading-relaxed text-[#9195C2]">
          Temporada de práctica: se juega la Liga Profesional 2024 fecha por fecha. Los partidos
          y resultados son reales.
        </p>
      )}

      {/* dev panel */}
      {isMockMode && (
        <div className="mx-4.5 my-3.5 rounded-2xl border border-dashed border-[#7C5CFF]/50 p-3.5 text-sm">
          <p className="mb-2 font-bold text-[#B9BCDA]">Panel dev (datos simulados de API-Football)</p>
          <div className="flex flex-wrap gap-2">
            <form action={runSyncNow}>
              <button type="submit" className="rounded-xl bg-[#1F2038] px-3 py-1.5 text-xs font-bold text-[#9195C2]">
                Sincronizar partidos ahora
              </button>
            </form>
            <a
              href="/pronosticos?festejoRacha=4"
              className="rounded-xl bg-[#1F2038] px-3 py-1.5 text-xs font-bold text-[#FF9D5C]"
            >
              Probar festejo de racha
            </a>
          </div>
        </div>
      )}

      {/* competencias */}
      <CompetitionTabs>
      {/* feed */}
      <div className="flex flex-col gap-3.5 px-4.5 pb-6">
        {visibleRounds.map(([round, roundMatches]) => {
          const isCurrentRound = round === group.roundKey;
          const roundHasPending = roundMatches.some((m) => m.status !== "finished");
          return (
          <div key={round} className="flex flex-col gap-2.5">
            <div className="text-xs font-extrabold tracking-wide text-[#8A8FB2]">
              {roundMatches.every((m) => m.status === "finished") ? "RESULTADOS" : "PENDIENTES"} · {round.toUpperCase()}
            </div>

            {isCurrentRound && roundHasPending && (
              <RoundProgress
                roundKey={round}
                predicted={predictedInRound}
                total={currentRoundMatches.length}
              />
            )}

            {roundMatches.map((match) => {
              const prediction = predictionByMatch.get(String(match._id));
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
                <div
                  key={String(match._id)}
                  className={`relative flex flex-col gap-2.5 rounded-2xl bg-[#15162A] p-3.5 ${
                    prediction?.predictedDirection ? "ring-1 ring-[#4FD17F]/25" : ""
                  }`}
                >
                  {prediction?.predictedDirection && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4FD17F] text-[#0B0C16]"
                      aria-label="Pronóstico cargado"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
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

                  <MatchPredictor
                    matchId={String(match._id)}
                    kickoffAt={new Date(match.kickoffAt).toISOString()}
                    homeShortName={match.homeTeamId.shortName}
                    awayShortName={match.awayTeamId.shortName}
                    initialDirection={prediction?.predictedDirection ?? null}
                    initialHome={prediction?.predictedHomeScore ?? null}
                    initialAway={prediction?.predictedAwayScore ?? null}
                  />

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
          );
        })}

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
