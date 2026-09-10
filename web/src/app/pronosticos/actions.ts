"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import { PREDICTION_DIRECTIONS } from "@/models/Prediction";
import { getCurrentUser } from "@/lib/session";
import { syncAllCompetitions } from "@/lib/sync";
import { runBots } from "@/lib/bots";
import { setMockResult, resetMockFixture, postponeMockFixture } from "@/lib/fixtures";
import { isPredictionLocked } from "@/lib/time";
import { markBadgesSeen } from "@/lib/badges";
import { markStreakSeen } from "@/lib/profile";

export async function submitDirection(matchId: string, direction: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!PREDICTION_DIRECTIONS.includes(direction as (typeof PREDICTION_DIRECTIONS)[number])) {
    throw new Error("Dirección de pronóstico inválida");
  }

  await connectToDatabase();
  const match = await MatchModel.findById(matchId);
  if (!match) {
    throw new Error("Partido no encontrado");
  }
  if (isPredictionLocked(match.kickoffAt)) {
    throw new Error("La carga cerró: se cierra 1 hora antes del partido");
  }

  await PredictionModel.findOneAndUpdate(
    { userId: user._id, matchId: match._id },
    { predictedDirection: direction, updatedAt: new Date() },
    { upsert: true, setDefaultsOnInsert: true }
  );

  revalidatePath("/pronosticos");
}

export async function submitExactScore(matchId: string, homeScore: number, awayScore: number) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    throw new Error("Los goles tienen que ser números enteros positivos");
  }

  await connectToDatabase();
  const match = await MatchModel.findById(matchId);
  if (!match) {
    throw new Error("Partido no encontrado");
  }
  if (isPredictionLocked(match.kickoffAt)) {
    throw new Error("La carga cerró: se cierra 1 hora antes del partido");
  }

  const direction = homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw";

  await PredictionModel.findOneAndUpdate(
    { userId: user._id, matchId: match._id },
    { predictedDirection: direction, predictedHomeScore: homeScore, predictedAwayScore: awayScore, updatedAt: new Date() },
    { upsert: true, setDefaultsOnInsert: true }
  );

  revalidatePath("/pronosticos");
}

// Vuelve al pronóstico "solo dirección": borra el marcador exacto pero conserva la ficha 1-X-2.
export async function clearExactScore(matchId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectToDatabase();
  const match = await MatchModel.findById(matchId);
  if (!match) {
    throw new Error("Partido no encontrado");
  }
  if (isPredictionLocked(match.kickoffAt)) {
    throw new Error("La carga cerró: se cierra 1 hora antes del partido");
  }

  await PredictionModel.findOneAndUpdate(
    { userId: user._id, matchId: match._id },
    { $set: { predictedHomeScore: null, predictedAwayScore: null, updatedAt: new Date() } }
  );

  revalidatePath("/pronosticos");
}

export async function runSyncNow() {
  await syncAllCompetitions();
  await runBots();
  revalidatePath("/pronosticos");
}

// Marca como vistas las insignias recién ganadas — cierra el festejo de /pronosticos. Marca
// también la racha vista: si una insignia de fuego (3/5/8) tapó al festejo de racha, no
// queremos que salte enseguida después.
export async function dismissBadges() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await markBadgesSeen(user._id);
  await markStreakSeen(user._id);
  revalidatePath("/pronosticos");
}

// Cierra el festejo de racha. Redirige (en vez de revalidar) para soltar el ?festejoRacha
// del preview dev y volver a la pantalla limpia.
export async function dismissStreak() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await markStreakSeen(user._id);
  redirect("/pronosticos");
}

export async function finishMockMatch(formData: FormData) {
  const externalId = Number(formData.get("externalId"));
  const homeScore = Number(formData.get("resultHomeScore"));
  const awayScore = Number(formData.get("resultAwayScore"));

  setMockResult(externalId, homeScore, awayScore);
  await syncAllCompetitions();
  revalidatePath("/pronosticos");
}

export async function postponeMockMatch(formData: FormData) {
  const externalId = Number(formData.get("externalId"));

  postponeMockFixture(externalId);
  await syncAllCompetitions();
  revalidatePath("/pronosticos");
}

export async function resetMockMatch(formData: FormData) {
  const matchId = String(formData.get("matchId"));
  const externalId = Number(formData.get("externalId"));

  resetMockFixture(externalId);
  await syncAllCompetitions();

  await connectToDatabase();
  await PredictionModel.deleteMany({ matchId });
  await runBots();

  revalidatePath("/pronosticos");
}
