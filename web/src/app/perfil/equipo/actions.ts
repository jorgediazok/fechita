"use server";

import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/session";

export async function changeFavoriteTeam(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clubId = String(formData.get("clubId") ?? "");
  if (!mongoose.isValidObjectId(clubId)) {
    throw new Error("Elegí un club");
  }

  user.favoriteTeamId = new mongoose.Types.ObjectId(clubId);
  await user.save();

  redirect("/perfil");
}
