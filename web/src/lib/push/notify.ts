import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import UserModel from "@/models/User";
import { isPushConfigured } from "./keys";
import { sendToUser } from "./send";
import { resultReadyMessage } from "./messages";

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
