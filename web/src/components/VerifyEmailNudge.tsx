"use client";

import { useActionState } from "react";
import { resendVerificationAction, type ResendVerificationState } from "@/app/pronosticos/actions";

// "Existe la cuenta" ≠ "participa": se muestra en /pronosticos y /grupos mientras el usuario
// (de Credentials — los de Google ya vienen verificados) no confirmó el email.
export function VerifyEmailNudge({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ResendVerificationState, FormData>(
    resendVerificationAction,
    {}
  );

  return (
    <div className="mx-4.5 mt-3 rounded-2xl border border-[#6845E0]/40 bg-[#1B1730] px-3.5 py-3">
      <p className="text-[12px] font-bold leading-snug text-[#C9B8FF]">
        Confirmá tu email ({email}) para cargar pronósticos y crear o unirte a un grupo.
      </p>
      <form action={action} className="mt-1.5">
        <button
          type="submit"
          disabled={pending}
          className="text-[11px] font-extrabold text-[#C9B8FF] underline underline-offset-2 disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Reenviar mail de confirmación"}
        </button>
      </form>
      {state.sent && (
        <p className="mt-1.5 text-[11px] font-bold text-[#4FD17F]">
          Listo, revisá tu bandeja de entrada (y spam, por las dudas).
        </p>
      )}
      {state.error && <p className="mt-1.5 text-[11px] font-bold text-[#FFA9B6]">{state.error}</p>}
    </div>
  );
}
