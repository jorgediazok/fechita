"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import { closeExpiredGroups, acknowledgeLeagueResult, getCurrentRoundKey } from "@/lib/leagues";
import { syncAllCompetitions } from "@/lib/sync";
import { setMockResult } from "@/lib/fixtures";
import { isMockMode } from "@/lib/fixtures/source";
import { runBots } from "@/lib/bots";

// Solo panel dev (modo mock): termina los partidos de la fecha actual con un resultado
// al azar, sincroniza (calcula puntos), y cierra la fecha — para probar ascenso/descenso
// sin esperar a que se juegue de verdad. Al cerrarse, closeExpiredGroups reinscribe a
// todos en el grupo de la fecha siguiente.
export async function closeRoundNow() {
  if (!isMockMode()) return;
  await connectToDatabase();

  const roundKey = await getCurrentRoundKey();
  if (roundKey) {
    const pending = await MatchModel.find({
      round: roundKey,
      status: { $in: ["scheduled", "live"] },
    });
    for (const m of pending) {
      setMockResult(m.externalId, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
    }
    await syncAllCompetitions();
  }

  await closeExpiredGroups();
  await runBots(); // que los bots pronostiquen la ventana de la fecha nueva
  revalidatePath("/liga");
}

export async function acknowledgeResult(formData: FormData) {
  const membershipId = String(formData.get("membershipId"));
  await acknowledgeLeagueResult(membershipId);
  revalidatePath("/liga");
}
