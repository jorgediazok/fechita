"use server";

import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
import { setCurrentUserCookie } from "@/lib/session";
import mongoose from "mongoose";

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function pickUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Ingresá un nombre");
  }

  const clubIdRaw = String(formData.get("clubId") ?? "");
  const favoriteTeamId = mongoose.isValidObjectId(clubIdRaw) ? clubIdRaw : undefined;

  await connectToDatabase();

  const slug = slugify(name) || "usuario";
  const email = `${slug}@dev.local`;

  let user = await UserModel.findOne({ email });
  if (!user) {
    user = await UserModel.create({ name, email, favoriteTeamId });
  } else if (favoriteTeamId) {
    user.favoriteTeamId = new mongoose.Types.ObjectId(favoriteTeamId);
    await user.save();
  }

  await setCurrentUserCookie(String(user._id));
  redirect("/duelos");
}
