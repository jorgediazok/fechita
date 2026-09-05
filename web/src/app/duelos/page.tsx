import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import UserModel from "@/models/User";
import { isPast } from "@/lib/time";
import { submitDirection, submitExactScore, runSyncNow, finishMockMatch, resetMockMatch } from "./actions";

const isMockMode = process.env.API_FOOTBALL_MODE !== "live";

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

function TeamBadge({ team, size = 34 }: { team: PopulatedTeam; size?: number }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0B0C16]"
      style={{ width: size, height: size }}
    >
      {team.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.logoUrl} alt="" className="h-[70%] w-[70%] object-contain" />
      ) : (
        <span className="text-[9px] font-extrabold text-[#6B6F94]">
          {team.shortName.slice(0, 3).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default async function DuelosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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

  return (
    <main className="min-h-screen bg-[#0B0C16] pb-28 text-white"
      style={{
        backgroundImage:
          "radial-gradient(520px circle at 8% -6%, rgba(124,92,255,0.28), transparent 55%), radial-gradient(460px circle at 104% 10%, rgba(255,79,195,0.20), transparent 50%)",
      }}
    >
      {/* hero */}
      <div
        className="px-6 pt-5 pb-8"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between text-[#0B0C16]">
          <span className="text-[11px] font-extrabold tracking-wide">
            {user.name.toUpperCase()} · {totalPoints} PTS
          </span>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-[#0B0C16]/15">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9z" stroke="#0B0C16" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {totalPlayers > 0 && (
          <>
            <div className="mt-2.5 flex items-center justify-center gap-3.5">
              <div className="font-display text-[46px] leading-none text-[#0B0C16]">
                {myRank}°
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="font-display text-[13px] text-[#0B0C16]">
                  DE {totalPlayers} JUGADORES
                </div>
                <div className="text-[11px] font-extrabold text-[#0B0C16]/60">{totalPoints} pts en total</div>
              </div>
            </div>

            <div className="relative mt-3.5 h-2.5 rounded-full bg-[#0B0C16]/18">
              <div className="absolute left-0 top-0 h-full w-[26%] rounded-l-full bg-[#0B0C16]/30" />
              <div className="absolute right-0 top-0 h-full w-[26%] rounded-r-full bg-[#FF2D95]/30" />
              <div
                className="absolute -top-[5px] h-5 w-5 rounded-full border-[3px] border-white bg-[#0B0C16] shadow-[0_0_0_4px_rgba(11,12,22,0.18)]"
                style={{ left: `${positionPct}%`, transform: "translateX(-50%)" }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-extrabold text-[#0B0C16]/55">
              <span>ZONA DE ASCENSO</span>
              <span>ZONA DE DESCENSO</span>
            </div>

            <div className="mt-3 flex justify-center">
              <div className="rounded-full bg-[#0B0C16] px-4 py-1.5 font-display text-[11px] text-[#4FD17F]">
                {myIndex === 0 ? "SOS 1°" : `A ${gapToNext} PTS DEL ${myRank - 1}°`}
              </div>
            </div>
          </>
        )}
      </div>

      {/* tu zona en la tabla */}
      {nearby.length > 1 && (
        <div className="px-4.5 pt-3.5 pb-1">
          <div className="mb-2 font-display text-[11px] tracking-wide text-[#6B6F94]">
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
                  <span className={`w-3.5 text-center font-display text-[11px] ${isMe ? "text-[#A390FF]" : "text-[#6B6F94]"}`}>
                    {rank}
                  </span>
                  <span className="text-[11px] font-extrabold text-[#E4E6F7]">{n.name}</span>
                  <span className="font-display text-[11px] text-[#9195C2]">{n.total}</span>
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
        <span className="flex-shrink-0 rounded-full bg-gradient-to-br from-[#6845E0] to-[#9B5CFF] px-3 py-1.5 font-display text-[10px]">
          LIGA
        </span>
        <span className="flex-shrink-0 rounded-full bg-[#1F2038] px-3 py-1.5 font-display text-[10px] text-[#57628A]" title="Todavía no sincronizada">
          COPA ARGENTINA
        </span>
        <span className="flex-shrink-0 rounded-full bg-[#1F2038] px-3 py-1.5 font-display text-[10px] text-[#57628A]" title="Todavía no sincronizada">
          LIBERTADORES
        </span>
      </div>

      {/* feed */}
      <div className="flex flex-col gap-3.5 px-4.5 pb-6">
        {[...matchesByRound.entries()].map(([round, roundMatches]) => (
          <div key={round} className="flex flex-col gap-2.5">
            <div className="font-display text-xs tracking-wide text-[#6B6F94]">
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
                    <div className="text-[10px] font-extrabold text-[#6B6F94]">
                      {dateFormatter.format(new Date(match.kickoffAt))}
                    </div>
                    <TeamBadge team={match.awayTeamId} />
                  </div>

                  {kickoffPassed ? (
                    <p className="text-xs font-bold text-[#6B6F94]">Ya arrancó, carga cerrada.</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        {(["home", "draw", "away"] as const).map((dir) => {
                          const selected = prediction?.predictedDirection === dir;
                          return (
                            <form action={submitDirection} key={dir} className="flex-1">
                              <input type="hidden" name="matchId" value={String(match._id)} />
                              <input type="hidden" name="direction" value={dir} />
                              <button
                                type="submit"
                                className={`w-full rounded-[10px] py-2.5 font-display text-[13px] ${
                                  selected
                                    ? "bg-gradient-to-br from-[#6845E0] to-[#9B5CFF] text-white shadow-[0_6px_16px_rgba(124,92,255,0.4)]"
                                    : "bg-[#1F2038] text-[#9195C2]"
                                }`}
                              >
                                {dir === "home" ? "1" : dir === "draw" ? "X" : "2"}
                              </button>
                            </form>
                          );
                        })}
                      </div>

                      <details className="group">
                        <summary className="cursor-pointer list-none text-center text-[11px] font-extrabold text-[#6B6F94]">
                          ¿EXACTO? +5 PTS
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
      </div>

      {/* bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-[#15162A] px-6 py-3.5 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-8 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#6845E0] to-[#9B5CFF] shadow-[0_4px_14px_rgba(124,92,255,0.45)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M8 21h8M12 3v6M6 9h12l-1.5 6a4.5 4.5 0 01-9 0L6 9z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[9px] font-extrabold text-[#7C5CFF]">DUELOS</span>
        </div>
        <Link href="/liga" className="flex flex-col items-center gap-1">
          <div className="flex h-8 w-10 items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 21V10M12 21V3M20 21v-7" stroke="#6B6F94" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[9px] font-extrabold text-[#6B6F94]">LIGA</span>
        </Link>
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
    </main>
  );
}
