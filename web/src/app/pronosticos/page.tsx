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
  const totalPoints = predictions.reduce((sum, p) => sum + (p.points ?? 0), 0);

  // Ranking real entre todos los usuarios que se loguearon en esta instancia. Todavía no existe
  // el sistema real de "ligas semanales" (capas 3-6 del doc) con categorías/ascenso-descenso —
  // esto es un ranking global simple a modo de base visual para esa futura mecánica.
  const allUsers = (await UserModel.find({}).select("_id name").lean()) as unknown as {
    _id: string;
    name: string;
  }[];
  const totalsByUser = await PredictionModel.aggregate<{ _id: string; total: number }>([
    { $match: { points: { $ne: null } } },
    { $group: { _id: "$userId", total: { $sum: "$points" } } },
  ]);
  const totalsMap = new Map(totalsByUser.map((t) => [String(t._id), t.total]));
  const leaderboard = allUsers
    .map((u) => ({ id: String(u._id), name: u.name, total: totalsMap.get(String(u._id)) ?? 0 }))
    .sort((a, b) => b.total - a.total);
  const myIndex = leaderboard.findIndex((u) => u.id === String(user._id));
  const myRank = myIndex + 1;
  const totalPlayers = leaderboard.length;
  const nearby = leaderboard.slice(Math.max(0, myIndex - 2), myIndex + 3);
  const gapToNext = myIndex > 0 ? leaderboard[myIndex - 1].total - leaderboard[myIndex].total : 0;
  const positionPct = totalPlayers > 1 ? (myIndex / (totalPlayers - 1)) * 100 : 0;

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
              <svg width="16" height="16" viewBox="0 0 512 512" fill="#F5F5FF">
                <path d="M417.3 360.1l-71.6-4.8c-5.2-.3-10.3 1.1-14.5 4.2s-7.2 7.4-8.4 12.5l-17.6 69.6C289.5 445.8 273 448 256 448s-33.5-2.2-49.2-6.4L189.2 372c-1.3-5-4.3-9.4-8.4-12.5s-9.3-4.5-14.5-4.2l-71.6 4.8c-17.6-27.2-28.5-59.2-30.4-93.6L125 228.3c4.4-2.8 7.6-7 9.2-11.9s1.4-10.2-.5-15l-26.7-66.6C128 109.2 155.3 89 186.7 76.9l55.2 46c4 3.3 9 5.1 14.1 5.1s10.2-1.8 14.1-5.1l55.2-46c31.3 12.1 58.7 32.3 79.6 57.9l-26.7 66.6c-1.9 4.8-2.1 10.1-.5 15s4.9 9.1 9.2 11.9l60.7 38.2c-1.9 34.4-12.8 66.4-30.4 93.6zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm14.1-325.7c-8.4-6.1-19.8-6.1-28.2 0L194 221c-8.4 6.1-11.9 16.9-8.7 26.8l18.3 56.3c3.2 9.9 12.4 16.6 22.8 16.6l59.2 0c10.4 0 19.6-6.7 22.8-16.6l18.3-56.3c3.2-9.9-.3-20.7-8.7-26.8l-47.9-34.8z" />
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
                    DE {totalPlayers} JUGADORES
                  </div>
                  <div className="text-[11px] font-extrabold text-[#F5F5FF]/65">{totalPoints} pts en total</div>
                </div>
              </div>

              <div className="relative mt-3.5 h-2.5 rounded-full bg-white/12">
                <div className="absolute left-0 top-0 h-full w-[26%] rounded-l-full bg-white/18" />
                <div className="absolute right-0 top-0 h-full w-[26%] rounded-r-full bg-[#FF2D95]/40" />
                <div
                  className="absolute -top-[5px] h-5 w-5 rounded-full border-[3px] border-white bg-[#0B0C16] shadow-[0_0_0_4px_rgba(11,12,22,0.3)]"
                  style={{ left: `${positionPct}%`, transform: "translateX(-50%)" }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[9px] font-extrabold tracking-wide text-[#F5F5FF]/50">
                <span>ZONA DE ASCENSO</span>
                <span>ZONA DE DESCENSO</span>
              </div>

              <div className="mt-3 flex justify-center">
                <div
                  className="rounded-full px-4 py-1.5 text-[11px] font-extrabold tracking-wide text-[#4FD17F]"
                  style={{ background: "rgba(79,209,127,0.16)", border: "1px solid rgba(79,209,127,0.4)" }}
                >
                  {myIndex === 0 ? "SOS 1°" : `A ${gapToNext} PTS DEL ${myRank - 1}°`}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* tu zona en la tabla */}
      {nearby.length > 1 && (
        <div className="px-4.5 pt-3.5 pb-1">
          <div className="mb-2 text-[11px] font-extrabold tracking-wide text-[#6B6F94]">
            TU ZONA EN LA TABLA
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {nearby.map((n) => {
              const isMe = n.id === String(user._id);
              const rank = leaderboard.indexOf(n) + 1;
              return (
                <div
                  key={n.id}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-full py-1.5 pl-1 pr-3 ${
                    isMe ? "border-[1.5px] border-[#7C5CFF] bg-[#23244A]" : "border-[1.5px] border-transparent bg-[#15162A]"
                  }`}
                >
                  <span className={`w-3.5 text-center text-[11px] font-extrabold ${isMe ? "text-[#A390FF]" : "text-[#6B6F94]"}`}>
                    {rank}
                  </span>
                  <span className="text-[11px] font-extrabold text-[#E4E6F7]">{n.name}</span>
                  <span className="text-[11px] font-extrabold text-[#9195C2]">{n.total}</span>
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
      <div className="flex gap-1.5 overflow-x-auto px-4.5 pb-2 pt-1">
        <span className="flex-shrink-0 rounded-full bg-gradient-to-br from-[#6845E0] to-[#9B5CFF] px-3 py-1.5 text-[10px] font-extrabold tracking-wide">
          LIGA
        </span>
        <span className="flex-shrink-0 rounded-full bg-[#1F2038] px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#57628A]" title="Todavía no sincronizada">
          COPA ARGENTINA
        </span>
        <span className="flex-shrink-0 rounded-full bg-[#1F2038] px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#57628A]" title="Todavía no sincronizada">
          LIBERTADORES
        </span>
      </div>

      {/* feed */}
      <div className="flex flex-col gap-3.5 px-4.5 pb-6">
        {visibleRounds.map(([round, roundMatches]) => (
          <div key={round} className="flex flex-col gap-2.5">
            <div className="text-xs font-extrabold tracking-wide text-[#6B6F94]">
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
                          prediction.points === 5 ? "bg-[#FF2D95]" : prediction.points === 3 ? "bg-[#4FD17F]" : "bg-[#2A2C48] text-[#6B6F94]"
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
                      <div className="text-[10px] font-extrabold text-[#6B6F94]">
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
                    <p className="text-xs font-bold text-[#6B6F94]">Ya arrancó, carga cerrada.</p>
                  ) : (
                    <>
                      <DirectionPicker
                        matchId={String(match._id)}
                        initialDirection={prediction?.predictedDirection ?? null}
                      />

                      <details className="group flex flex-col items-center">
                        <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-full border border-dashed border-[#3A3D5C] px-3 py-1.5 text-[11px] font-extrabold text-[#6B6F94] [&::-webkit-details-marker]:hidden">
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
                            className="h-[34px] w-[34px] rounded-[9px] bg-[#0B0C16] text-center font-display text-sm text-[#A390FF] shadow-[inset_0_0_0_1.5px_#7C5CFF] outline-none"
                          />
                          <span className="font-display text-xs text-[#3A3D5C]">-</span>
                          <input
                            type="number"
                            name="awayScore"
                            min={0}
                            defaultValue={prediction?.predictedAwayScore ?? undefined}
                            className="h-[34px] w-[34px] rounded-[9px] bg-[#0B0C16] text-center font-display text-sm text-[#A390FF] shadow-[inset_0_0_0_1.5px_#7C5CFF] outline-none"
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
          <p className="text-sm text-[#6B6F94]">
            Todavía no hay partidos sincronizados.
            {isMockMode && ' Usá el botón "Sincronizar partidos ahora".'}
          </p>
        )}

        {matches.length > 0 && visibleRounds.length === 0 && (
          <p className="text-sm text-[#6B6F94]">
            La próxima fecha todavía no arranca — se habilita 3 días antes de su primer partido.
          </p>
        )}
      </div>
    </PhoneFrame>
  );
}
