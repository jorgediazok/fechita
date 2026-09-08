"use server";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";

export type SignupState = { error?: string };

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const clubId = String(formData.get("clubId") ?? "");

  if (!name) return { error: "Ingresá tu nombre." };
  if (!email) return { error: "Ingresá un email válido." };
  if (password.length < 6) return { error: "La contraseña tiene que tener al menos 6 caracteres." };
  if (!mongoose.isValidObjectId(clubId)) return { error: "Elegí tu club." };

  await connectToDatabase();

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email. Probá entrar." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.create({ name, email, passwordHash, favoriteTeamId: clubId });

  try {
    await signIn("credentials", { email, password, redirectTo: "/pronosticos" });
  } catch (error) {
    // El NEXT_REDIRECT del login exitoso se re-lanza; solo el AuthError se muestra.
    if (error instanceof AuthError) {
      return { error: "La cuenta se creó pero no pudimos iniciar sesión. Entrá desde la pantalla de login." };
    }
    throw error;
  }

  return {};
}
