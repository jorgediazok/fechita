import Link from "next/link";
import { PhoneFrame } from "@/components/PhoneFrame";
import { loginWithGoogle, loginWithCredentials } from "./actions";

export default function LoginPage() {
  return (
    <PhoneFrame>
      <div
        className="px-7 pt-10 pb-14"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-4 border-white bg-[#0B0C16] shadow-[0_10px_28px_rgba(0,0,0,0.4)]">
            <svg width="32" height="32" viewBox="0 0 34 34">
              <path d="M17 4 L23 9 L21 16 L13 16 L11 9 Z" fill="#FF2D95" />
              <path d="M4 17 L9 11 L16 13 L16 21 L9 23 Z" fill="#FF2D95" />
              <path d="M30 17 L25 23 L18 21 L18 13 L25 11 Z" fill="#FF2D95" />
              <path d="M17 30 L11 25 L13 18 L21 18 L23 25 Z" fill="#FF2D95" />
            </svg>
          </div>
          <h1 className="font-display text-[32px] leading-none text-[#0B0C16]">
            CÓMO VAN
          </h1>
          <p className="text-center text-[13px] font-bold text-[#0B0C16]/70">
            Pronosticá. Sumá puntos. Bancá a tu club.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-7 py-7">
        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-[#2A2C48] bg-[#15162A] py-3.5 text-sm font-extrabold text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
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
          <span className="text-[11px] font-extrabold text-[#6B6F94]">O CON TU CUENTA</span>
          <div className="h-px flex-1 bg-[#2A2C48]" />
        </div>

        <form action={loginWithCredentials} className="flex flex-col gap-3">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-2xl border-2 border-[#2A2C48] bg-[#15162A] px-4 py-3.5 text-base font-extrabold text-white outline-none placeholder:text-[#6B6F94]"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            className="w-full rounded-2xl border-2 border-[#2A2C48] bg-[#15162A] px-4 py-3.5 text-base font-extrabold text-white outline-none placeholder:text-[#6B6F94]"
          />
          <button
            type="submit"
            className="mt-1 rounded-2xl py-4 font-display text-lg tracking-wide text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)]"
            style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
          >
            ENTRAR
          </button>
        </form>

        <p className="text-center text-xs font-bold text-[#6B6F94]">
          ¿No tenés cuenta?{" "}
          <Link href="/signup" className="text-[#A390FF] underline">
            Creá una
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
}
