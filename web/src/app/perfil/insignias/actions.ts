"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isMockMode } from "@/lib/fixtures/source";
import { evaluateBadgesForUser, resetUserBadges, BADGE_IDS } from "@/lib/badges";
import UserBadgeModel from "@/models/UserBadge";

function revalidate() {
  revalidatePath("/perfil/insignias");
  revalidatePath("/perfil");
  revalidatePath("/pronosticos");
}

// Panel dev (modo mock): correr los criterios reales ahora mismo.
export async function devReevaluateBadges() {
  if (!isMockMode()) return;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await evaluateBadgesForUser(user._id);
  revalidate();
}

// Panel dev (modo mock): borrar todas las insignias del usuario actual.
export async function devResetBadges() {
  if (!isMockMode()) return;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await resetUserBadges(user._id);
  revalidate();
}

// Panel dev (modo mock): otorga la próxima insignia que falte, sin ver, para disparar el
// festejo de /pronosticos y poder iterar la animación. Clicks sucesivos recorren todas.
export async function devSimulateBadge() {
  if (!isMockMode()) return;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await connectToDatabase();

  const owned = new Set(
    (await UserBadgeModel.find({ userId: user._id }, { badgeId: 1 })).map((d) => d.badgeId)
  );
  const nextId = BADGE_IDS.find((id) => !owned.has(id));
  if (nextId) {
    await UserBadgeModel.updateOne(
      { userId: user._id, badgeId: nextId },
      { $setOnInsert: { userId: user._id, badgeId: nextId, earnedAt: new Date(), seen: false } },
      { upsert: true }
    );
  }
  revalidate();
}
