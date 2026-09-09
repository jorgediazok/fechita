import { NextResponse, type NextRequest } from "next/server";
import { syncAllCompetitions } from "@/lib/sync";
import { runBots } from "@/lib/bots";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import DevStateModel from "@/models/DevState";
import { getFixtureSource } from "@/lib/api-football";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// El cron de Vercel se dispara seguido (cada 3h), pero pegarle a la fuente de partidos solo
// tiene sentido cuando hay algo para traer. En Argentina se juega vie-lun y después hay
// varios días sin nada — esto evita gastar requests (y créditos, en The Odds API) al pedo.
async function shouldSync(): Promise<{ sync: boolean; reason: string }> {
  await connectToDatabase();
  const now = Date.now();
  const state = await DevStateModel.findOne({ key: "singleton" });
  const sinceLast = state?.lastSyncAt ? now - new Date(state.lastSyncAt).getTime() : Infinity;

  // Red de seguridad: sincronizar sí o sí si hace mucho que no.
  if (sinceLast > 3 * DAY) return { sync: true, reason: "sin sincronizar hace >3 días" };

  // Un partido ya arrancó y todavía no tenemos su resultado → traer scores.
  const pendingResult = await MatchModel.exists({
    status: { $in: ["scheduled", "live"] },
    kickoffAt: { $gte: new Date(now - 3 * DAY), $lte: new Date(now) },
  });
  if (pendingResult) return { sync: true, reason: "hay partidos jugados sin resultado" };

  // Se viene una fecha (partido dentro de 5 días) y los fixtures pueden haber cambiado.
  if (sinceLast > 18 * HOUR) {
    const upcoming = await MatchModel.exists({
      kickoffAt: { $gte: new Date(now), $lte: new Date(now + 5 * DAY) },
    });
    if (upcoming) return { sync: true, reason: "fecha próxima, refrescar fixtures" };
  }

  return { sync: false, reason: "sin partidos por jugar ni resultados pendientes" };
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  // El modo mock/replay no cuesta nada y no depende de una ventana de partidos reales.
  const alwaysSync = ["mock", "replay"].includes(getFixtureSource());
  const { sync, reason } = alwaysSync ? { sync: true, reason: "modo local" } : await shouldSync();

  if (!sync) {
    return NextResponse.json({ ok: true, skipped: reason });
  }

  const results = await syncAllCompetitions();
  const bots = await runBots();
  await DevStateModel.updateOne(
    { key: "singleton" },
    { $set: { lastSyncAt: new Date() }, $setOnInsert: { key: "singleton" } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true, reason, results, bots });
}
