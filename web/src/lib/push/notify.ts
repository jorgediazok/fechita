import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { predictionLockAt } from "@/lib/time";
import { getCurrentRoundKey } from "@/lib/leagues";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import UserModel from "@/models/User";
import RoundLeagueGroupModel from "@/models/RoundLeagueGroup";
import LeagueMembershipModel from "@/models/LeagueMembership";
import { isPushConfigured } from "./keys";
import { sendToUser } from "./send";
import { resultReadyMessage, roundClosingMessage } from "./messages";

const HOUR = 60 * 60 * 1000;

// T2 — "Se terminó la Fecha X · sumaste N pts". Se llama desde el sync con las rondas que
// tuvieron un partido terminado en esa corrida. Solo notifica una ronda cuando TODOS sus
// partidos terminaron, y solo a usuarios reales que pronosticaron al menos un partido de
// esa ronda. El dedupe por `dedupeKey = round` garantiza una sola notificación por fecha.
export async function notifyFinishedRounds(rounds: string[]): Promise<void> {
  if (!isPushConfigured() || rounds.length === 0) return;

  try {
    await connectToDatabase();

    for (const round of new Set(rounds)) {
      const roundMatches = await MatchModel.find({ round }, { _id: 1, status: 1 });
      if (roundMatches.length === 0) continue;
      const allFinished = roundMatches.every((m) => m.status === "finished");
      if (!allFinished) continue;

      const matchIds = roundMatches.map((m) => m._id);

      const totals = await PredictionModel.aggregate<{ _id: Types.ObjectId; total: number }>([
        { $match: { matchId: { $in: matchIds } } },
        { $group: { _id: "$userId", total: { $sum: { $ifNull: ["$points", 0] } } } },
      ]);
      if (totals.length === 0) continue;

      const realUserIds = new Set(
        (
          await UserModel.find(
            { _id: { $in: totals.map((t) => t._id) }, isBot: { $ne: true } },
            { _id: 1 }
          )
        ).map((u) => String(u._id))
      );

      for (const { _id, total } of totals) {
        const uid = String(_id);
        if (!realUserIds.has(uid)) continue;
        await sendToUser(uid, resultReadyMessage(round, total), {
          kind: "result",
          dedupeKey: round,
        });
      }
    }
  } catch (err) {
    console.warn("[push] notifyFinishedRounds falló:", err);
  }
}

// T5 — "Te faltan pronósticos, la carga cierra en ~2h". Se llama en cada corrida del cron
// (no depende de haber pegado a la fuente de partidos: es puro cálculo de tiempo contra
// Match.kickoffAt, ya en nuestra DB). Se fija en el partido más próximo sin arrancar de la
// fecha actual — el primero en cerrarse (`predictionLockAt`, lib/time.ts) — y avisa a los
// usuarios reales inscriptos en esa fecha que todavía no le cargaron un pronóstico. Ventana
// generosa (hasta 2h antes del cierre) a propósito, para no depender de que el cron pegue
// justo en el minuto exacto — el dedupe por `dedupeKey = roundKey` asegura un solo push por
// usuario aunque varias corridas caigan adentro de la ventana.
export async function notifyRoundClosingSoon(): Promise<void> {
  if (!isPushConfigured()) return;

  try {
    await connectToDatabase();

    const roundKey = await getCurrentRoundKey();
    if (!roundKey) return;

    const openMatches = await MatchModel.find(
      { round: roundKey, status: "scheduled" },
      { _id: 1, kickoffAt: 1 }
    ).sort({ kickoffAt: 1 });
    if (openMatches.length === 0) return;

    const earliest = openMatches[0];
    const msToLock = predictionLockAt(earliest.kickoffAt).getTime() - Date.now();
    if (msToLock <= 0 || msToLock > 2 * HOUR) return;

    const predictedEarliest = new Set(
      (await PredictionModel.find({ matchId: earliest._id }, { userId: 1 })).map((p) =>
        String(p.userId)
      )
    );

    const groups = await RoundLeagueGroupModel.find(
      { roundKey, status: "active" },
      { _id: 1 }
    );
    if (groups.length === 0) return;

    const memberIds = [
      ...new Set(
        (
          await LeagueMembershipModel.find(
            { groupId: { $in: groups.map((g) => g._id) } },
            { userId: 1 }
          )
        ).map((m) => String(m.userId))
      ),
    ].filter((id) => !predictedEarliest.has(id));
    if (memberIds.length === 0) return;

    const realUsers = await UserModel.find(
      { _id: { $in: memberIds }, isBot: { $ne: true } },
      { _id: 1 }
    );

    for (const u of realUsers) {
      await sendToUser(String(u._id), roundClosingMessage(roundKey), {
        kind: "round-closing",
        dedupeKey: roundKey,
      });
    }
  } catch (err) {
    console.warn("[push] notifyRoundClosingSoon falló:", err);
  }
}
