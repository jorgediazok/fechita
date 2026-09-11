"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export type LoginState = { error?: string };

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/pronosticos" });
}

export async function loginWithCredentials(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá tu email y tu contraseña." };
  }

  // Contra fuerza bruta / credential stuffing: máximo 10 intentos por IP cada 10 min,
  // acierten o no la contraseña.
  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`login:${ip}`, { max: 10, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return { error: "Demasiados intentos. Probá de nuevo en un rato." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/pronosticos" });
  } catch (error) {
    // AuthError = credenciales inválidas. Cualquier otra cosa (incluido el NEXT_REDIRECT
    // que tira signIn cuando el login sale bien) se re-lanza para que Next la maneje.
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }

  return {};
}
