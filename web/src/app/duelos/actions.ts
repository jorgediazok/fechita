"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import { PREDICTION_DIRECTIONS } from "@/models/Prediction";
import { getCurrentUser } from "@/lib/session";
import { syncAllCompetitions } from "@/lib/sync";
import { setMockResult, resetMockFixture } from "@/lib/api-football";
import { isPast } from "@/lib/time";

export async function submitDirection(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const matchId = String(formData.get("matchId"));
  const direction = String(formData.get("direction"));

  if (!PREDICTION_DIRECTIONS.includes(direction as (typeof PREDICTION_DIRECTIONS)[number])) {
    throw new Error("Dirección de pronóstico inválida");
  }

  await connectToDatabase();
  const match = await MatchModel.findById(matchId);
  if (!match) {
    throw new Error("Partido no encontrado");
  }
  if (isPast(match.kickoffAt)) {
    throw new Error("Ya arrancó el partido, no se puede cargar o editar el pronóstico");
  }

  await PredictionModel.findOneAndUpdate(
    { userId: user._id, matchId: match._id },
    { predictedDirection: direction, updatedAt: new Date() },
    { upsert: true, setDefaultsOnInsert: true }
  );

  revalidatePath("/duelos");
}

export async function submitExactScore(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const matchId = String(formData.get("matchId"));
  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    throw new Error("Los goles tienen que ser números enteros positivos");
  }

  await connectToDatabase();
  const match = await MatchModel.findById(matchId);
  if (!match) {
    throw new Error("Partido no encontrado");
  }
  if (isPast(match.kickoffAt)) {
    throw new Error("Ya arrancó el partido, no se puede cargar o editar el pronóstico");
  }

  const direction = homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw";

  await PredictionModel.findOneAndUpdate(
    { userId: user._id, matchId: match._id },
    { predictedDirection: direction, predictedHomeScore: homeScore, predictedAwayScore: awayScore, updatedAt: new Date() },
    { upsert: true, setDefaultsOnInsert: true }
  );

  revalidatePath("/duelos");
}

export async function runSyncNow() {
  await syncAllCompetitions();
  revalidatePath("/duelos");
}

export async function finishMockMatch(formData: FormData) {
  const externalId = Number(formData.get("externalId"));
  const homeScore = Number(formData.get("resultHomeScore"));
  const awayScore = Number(formData.get("resultAwayScore"));

  setMockResult(externalId, homeScore, awayScore);
  await syncAllCompetitions();
  revalidatePath("/duelos");
}

export async function resetMockMatch(formData: FormData) {
  const matchId = String(formData.get("matchId"));
  const externalId = Number(formData.get("externalId"));

  resetMockFixture(externalId);
  await syncAllCompetitions();

  await connectToDatabase();
  await PredictionModel.deleteMany({ matchId });

  revalidatePath("/duelos");
}
