import Link from "next/link";
import { PhoneFrame } from "@/components/PhoneFrame";
import { loginWithGoogle, loginWithCredentials } from "./actions";

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
              <svg width="34" height="34" viewBox="0 -960 960 960" fill="#FFFFFF">
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm200-500 54-18 16-54q-32-48-77-82.5T574-786l-54 38v56l160 112Zm-400 0 160-112v-56l-54-38q-54 17-99 51.5T210-652l16 54 54 18Zm-42 308 46-4 30-54-58-174-56-20-40 30q0 65 18 118.5T238-272Zm293 108q25-4 49-12l28-60-26-44H378l-26 44 28 60q24 8 49 12t51 4q26 0 51-4ZM390-360h180l56-160-146-102-144 102 54 160Zm332 88q42-50 60-103.5T800-494l-40-28-56 18-58 174 30 54 46 4Z" />
              </svg>
            </div>
            <h1 className="font-display text-[32px] leading-none text-white">
              CÓMO VAN
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
      </div>
    </PhoneFrame>
  );
}
