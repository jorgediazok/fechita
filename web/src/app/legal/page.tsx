import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y privacidad",
  description: "Términos de uso y política de privacidad.",
  alternates: { canonical: "/legal" },
};

export default async function LegalPage() {
  const loggedIn = Boolean(await getCurrentUser());

  return (
    <PhoneFrame nav={loggedIn ? <BottomNav active="perfil" /> : undefined}>
      <div
        className="px-6 pt-5 pb-9"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between text-white">
          <Link href={loggedIn ? "/perfil" : "/"} aria-label="Volver" className="rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="font-display text-lg">TÉRMINOS Y PRIVACIDAD</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="px-6 py-6 text-[13px] font-medium leading-relaxed text-[#9195C2]">
        <p>
          Los <b className="text-[#E4E6F7]">términos de uso</b> y la{" "}
          <b className="text-[#E4E6F7]">política de privacidad</b> de {SITE_NAME} todavía se
          están redactando.
        </p>
        <p className="mt-3">
          Van a estar publicados acá <b className="text-[#E4E6F7]">antes de que la app se
          abra al público</b>. Hoy {SITE_NAME} está en desarrollo y los datos que cargás
          (nombre, mail, club, pronósticos) se usan solo para que el juego funcione.
        </p>
      </div>
    </PhoneFrame>
  );
}
