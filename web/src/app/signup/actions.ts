"use server";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export type SignupState = { error?: string };

// Formato laxo a propósito (no hay verificación de email todavía, solo se descartan los que
// obviamente están mal tipeados).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  // Honeypot: campo oculto que un humano nunca completa (ver SignupForm.tsx). Un bot que
  // rellena todos los inputs del form cae acá — respondemos como si el alta hubiese andado,
  // sin crear nada, para no delatar el filtro.
  if (String(formData.get("website") ?? "").trim()) {
    return {};
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const clubId = String(formData.get("clubId") ?? "");

  if (!name) return { error: "Ingresá tu nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Ingresá un email válido." };
  if (password.length < 6) return { error: "La contraseña tiene que tener al menos 6 caracteres." };
  if (!mongoose.isValidObjectId(clubId)) return { error: "Elegí tu club." };

  // Máximo 5 altas por IP cada 10 min — generoso para un grupo de amigos en la misma red,
  // suficiente para frenar un registro masivo automatizado.
  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`signup:${ip}`, { max: 5, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return { error: "Demasiados intentos. Probá de nuevo en un rato." };
  }

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
