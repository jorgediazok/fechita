"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import WeeklyLeagueGroupModel from "@/models/WeeklyLeagueGroup";
import { closeExpiredGroups } from "@/lib/leagues";

// Solo para el panel dev: fuerza el cierre de todas las ligas semanales
// activas ahora mismo, para poder probar ascenso/descenso sin esperar a que
// termine la semana real.
export async function closeWeekNow() {
  await connectToDatabase();
  await WeeklyLeagueGroupModel.updateMany({ status: "active" }, { closesAt: new Date(0) });
  await closeExpiredGroups();
  revalidatePath("/liga");
}
