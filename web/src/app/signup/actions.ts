"use server";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";

export async function signupAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const clubId = String(formData.get("clubId") ?? "");

  if (!name) throw new Error("Ingresá tu nombre");
  if (!email) throw new Error("Ingresá un email válido");
  if (password.length < 6) throw new Error("La contraseña tiene que tener al menos 6 caracteres");
  if (!mongoose.isValidObjectId(clubId)) throw new Error("Elegí un club");

  await connectToDatabase();

  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw new Error("Ya existe una cuenta con ese email");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.create({ name, email, passwordHash, favoriteTeamId: clubId });

  try {
    await signIn("credentials", { email, password, redirectTo: "/duelos" });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("La cuenta se creó pero no se pudo iniciar sesión, entrá desde /login");
    }
    throw error;
  }
}
