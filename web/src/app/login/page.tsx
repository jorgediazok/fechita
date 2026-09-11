import type { Metadata } from "next";
import Link from "next/link";
import { PhoneFrame } from "@/components/PhoneFrame";
import { loginWithGoogle } from "./actions";
import { LoginForm } from "./LoginForm";
import { SITE_NAME } from "@/lib/site";
import { BrandMark } from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entrá a tu cuenta para cargar los pronósticos de la fecha y ver cómo vas en tu liga.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <PhoneFrame>
      <div className="flex min-h-full flex-col">
        <div
          className="px-7 pt-14 pb-24"
          style={{
            background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-4 border-white bg-[#0B0C16] shadow-[0_10px_28px_rgba(0,0,0,0.4)]">
              <BrandMark size={46} variant="mark" />
            </div>
            <h1 className="font-display text-[32px] leading-none text-white">
              {SITE_NAME.toUpperCase()}
            </h1>
            <p className="text-center text-[15px] font-bold text-white/70">
              Pronosticá. Sumá puntos. Bancá a tu club.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-7 pt-16 pb-7">
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-[#2A2C48] bg-[#15162A] py-3.5 text-sm font-extrabold text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75z" />
              </svg>
              Continuar con Google
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#2A2C48]" />
            <span className="text-[11px] font-extrabold text-[#8A8FB2]">O CON TU CUENTA</span>
            <div className="h-px flex-1 bg-[#2A2C48]" />
          </div>

          <LoginForm />

          <p className="text-center text-xs font-bold text-[#8A8FB2]">
            ¿No tenés cuenta?{" "}
            <Link href="/signup" className="text-[#A390FF] underline">
              Creá una
            </Link>
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
