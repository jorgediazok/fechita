"use client";

import { useActionState } from "react";
import { ClubPicker, type PickerTeam } from "@/components/ClubPicker";
import { signupAction, type SignupState } from "./actions";

const inputClass =
  "w-full rounded-2xl border-2 border-[#2A2C48] bg-[#15162A] px-4 py-3.5 text-base font-extrabold text-white placeholder:text-[#8A8FB2]";

export function SignupForm({ teams }: { teams: PickerTeam[] }) {
  const [state, action, pending] = useActionState<SignupState, FormData>(signupAction, {});

  return (
    <form action={action} className="flex flex-col gap-6 px-7 py-7">
      {/* Honeypot anti-bots: invisible y fuera del árbol de accesibilidad, un humano jamás lo
          completa. Si llega con valor, signupAction lo descarta en silencio. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      />

      <div className="flex flex-col gap-3">
        {state.error && (
          <p
            role="alert"
            className="rounded-xl bg-[#2A1620] px-3.5 py-2.5 text-[13px] font-bold text-[#FFA9B6]"
          >
            {state.error}
          </p>
        )}

        <label htmlFor="signup-name" className="sr-only">
          Tu nombre
        </label>
        <input
          id="signup-name"
          name="name"
          placeholder="Tu nombre"
          required
          autoComplete="name"
          className={inputClass}
        />

        <label htmlFor="signup-email" className="sr-only">
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          className={inputClass}
        />

        <label htmlFor="signup-password" className="sr-only">
          Contraseña (mínimo 6 caracteres)
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <ClubPicker teams={teams} legend="ELEGÍ TU CLUB" />

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-2xl py-4 font-display text-lg tracking-wide text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)] disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
      >
        {pending ? "CREANDO…" : "CREAR CUENTA"}
      </button>
    </form>
  );
}
