"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import WeeklyLeagueGroupModel from "@/models/WeeklyLeagueGroup";
import { closeExpiredGroups, acknowledgeLeagueResult, bumpDevWeek } from "@/lib/leagues";
import { runBots } from "@/lib/bots";

// Solo para el panel dev: fuerza el cierre de todas las ligas semanales
// activas ahora mismo, para poder probar ascenso/descenso sin esperar a que
// termine la semana real. bumpDevWeek() simula que pasó una semana de verdad
// (si no, el grupo siguiente cae en el mismo weekKey de hoy y recalcula los
// mismos puntos en vivo de las mismas predicciones, como si no hubiera pasado nada).
// El orden importa: primero se avanza la semana simulada para que la reinscripción
// que hace closeExpiredGroups arme los grupos nuevos en el weekKey siguiente.
export async function closeWeekNow() {
  await connectToDatabase();
  await bumpDevWeek();
  await WeeklyLeagueGroupModel.updateMany({ status: "active" }, { closesAt: new Date(0) });
  await closeExpiredGroups();
  await runBots(); // que los bots pronostiquen la ventana de la semana nueva
  revalidatePath("/liga");
}

export async function acknowledgeResult(formData: FormData) {
  const membershipId = String(formData.get("membershipId"));
  await acknowledgeLeagueResult(membershipId);
  revalidatePath("/liga");
}
