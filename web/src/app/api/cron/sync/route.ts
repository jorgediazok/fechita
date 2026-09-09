import { NextResponse, type NextRequest } from "next/server";
import { syncAllCompetitions } from "@/lib/sync";
import { runBots } from "@/lib/bots";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import DevStateModel from "@/models/DevState";
import { getFixtureSource } from "@/lib/api-football";
import type { FetchWindow } from "@/lib/api-football/provider";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// El cron externo (cron-job.org / GitHub Actions / Cloudflare) dispara este endpoint cada
// 2-3 min. Pegarle a la fuente de partidos solo tiene sentido cuando hay algo que traer, así
// que acá se decide qué hacer:
//
//  - "recent": hay un partido que arrancó hace 85-240 min y todavía no tenemos su resultado.
//    Es la ventana en la que el partido está terminando → poleo barato (1 crédito en The Odds
//    API) en cada tick hasta que llega el score. Así el resultado aparece ~5-10 min del final.
//  - "full": no hay partidos terminando pero se viene una fecha (partido dentro de 5 días) y
//    hace >12h del último refresco → traer fixtures nuevos. ~2 veces por día.
//  - "full" también como red de seguridad si hace >2 días que no se sincroniza.
//  - Si no aplica nada (mar-jue sin partidos) → skip, 0 requests.
async function decide(): Promise<{ window: FetchWindow | null; reason: string }> {
  await connectToDatabase();
  const now = Date.now();
  const state = await DevStateModel.findOne({ key: "singleton" });
  const sinceLast = state?.lastSyncAt ? now - new Date(state.lastSyncAt).getTime() : Infinity;

  // 45 + ~15 entretiempo + 45 + descuento ≈ 108-120 min: antes de los 105 min un partido no
  // terminó, poleá ahí sería tirar créditos. La cota de arriba (3h) deja de polear uno que
  // quedó colgado (suspendido, sin dato) — de eso se encarga la rama "full" de abajo.
  const finishing = await MatchModel.exists({
    status: { $in: ["scheduled", "live"] },
    kickoffAt: { $gte: new Date(now - 3 * HOUR), $lte: new Date(now - 105 * MIN) },
  });
  if (finishing) return { window: "recent", reason: "partido terminando, buscando resultado" };

  // Un partido viejo sin resultado (se escapó de la ventana de arriba, o el cron estuvo caído):
  // refresco completo, que trae los resultados de los últimos 3 días.
  if (sinceLast > 2 * HOUR) {
    const stale = await MatchModel.exists({
      status: { $in: ["scheduled", "live"] },
      kickoffAt: { $gte: new Date(now - 3 * DAY), $lte: new Date(now - 3 * HOUR) },
    });
    if (stale) return { window: "full", reason: "resultado atrasado" };
  }

  if (sinceLast > 2 * DAY) return { window: "full", reason: "sin sincronizar hace >2 días" };

  if (sinceLast > 12 * HOUR) {
    const fechaSoon = await MatchModel.exists({
      kickoffAt: { $gte: new Date(now), $lte: new Date(now + 5 * DAY) },
    });
    if (fechaSoon) return { window: "full", reason: "fecha próxima, refrescar fixtures" };
  }

  return { window: null, reason: "nada por jugar ni resultados pendientes" };
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  // mock/replay no cuestan nada y no dependen de una ventana real de partidos.
  const local = ["mock", "replay"].includes(getFixtureSource());
  const { window, reason } = local
    ? ({ window: "full", reason: "modo local" } as const)
    : await decide();

  if (!window) {
    return NextResponse.json({ ok: true, skipped: reason });
  }

  const results = await syncAllCompetitions(window);
  // En "recent" (poleo de resultados) no aparecen partidos nuevos para que los bots
  // pronostiquen — solo corren los bots en el refresco completo.
  const bots = window === "full" ? await runBots() : null;
  await DevStateModel.updateOne(
    { key: "singleton" },
    { $set: { lastSyncAt: new Date() }, $setOnInsert: { key: "singleton" } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true, window, reason, results, bots });
}
