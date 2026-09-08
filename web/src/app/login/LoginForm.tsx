"use client";

import { useActionState } from "react";
import { loginWithCredentials, type LoginState } from "./actions";

const inputClass =
  "w-full rounded-2xl border-2 border-[#2A2C48] bg-[#15162A] px-4 py-3.5 text-base font-extrabold text-white placeholder:text-[#8A8FB2]";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginWithCredentials, {});

  return (
    <form action={action} className="flex flex-col gap-3">
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-[#2A1620] px-3.5 py-2.5 text-[13px] font-bold text-[#FFA9B6]"
        >
          {state.error}
        </p>
      )}

      <label htmlFor="login-email" className="sr-only">
        Email
      </label>
      <input
        id="login-email"
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
        className={inputClass}
      />

      <label htmlFor="login-password" className="sr-only">
        Contraseña
      </label>
      <input
        id="login-password"
        name="password"
        type="password"
        placeholder="Contraseña"
        required
        autoComplete="current-password"
        className={inputClass}
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-2xl py-4 font-display text-lg tracking-wide text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)] disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
      >
        {pending ? "ENTRANDO…" : "ENTRAR"}
      </button>
    </form>
  );
}
