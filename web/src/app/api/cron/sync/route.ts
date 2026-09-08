import { NextResponse, type NextRequest } from "next/server";
import { syncAllCompetitions } from "@/lib/sync";
import { runBots } from "@/lib/bots";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const results = await syncAllCompetitions();
  const bots = await runBots();
  return NextResponse.json({ ok: true, results, bots });
}
