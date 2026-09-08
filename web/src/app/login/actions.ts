"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

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
