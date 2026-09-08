"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/pronosticos" });
}

export async function loginWithCredentials(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/pronosticos",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Email o contraseña incorrectos");
    }
    throw error;
  }
}
