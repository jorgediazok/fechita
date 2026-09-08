import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PhoneFrame } from "@/components/PhoneFrame";
import { deleteAccountAction } from "./actions";

export const metadata: Metadata = {
  title: "Eliminar cuenta",
  robots: { index: false, follow: false },
};

export default async function EliminarCuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <PhoneFrame>
      <div
        className="px-6 pt-5 pb-8"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between text-white">
          <Link href="/perfil" aria-label="Volver al perfil" className="rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="font-display text-lg">ELIMINAR CUENTA</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="flex flex-col gap-5 px-6 py-7">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-[#2A1620] p-5 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="#FF4D6D" strokeWidth="2" />
            <path d="M12 8v5" stroke="#FF4D6D" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M12 16.5h.01" stroke="#FF4D6D" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
          <p className="font-display text-lg text-[#FF4D6D]">¿ESTÁS SEGURO?</p>
          <p className="text-[13px] font-bold text-[#E4A9B4]">
            Esta acción no se puede deshacer. Si eliminás tu cuenta, {user.name}, perdés para siempre:
          </p>
        </div>

        <ul className="flex flex-col gap-2.5 rounded-2xl bg-[#15162A] p-4 text-[13px] font-bold text-[#B9BCDA]">
          <li>· Todos tus pronósticos y los puntos que sumaste</li>
          <li>· Tu posición y categoría en la liga semanal</li>
          <li>· Tu lugar en los grupos privados a los que pertenecés</li>
          <li>· Tu perfil (nombre, email, club)</li>
        </ul>

        <form action={deleteAccountAction}>
          <button
            type="submit"
            className="w-full rounded-2xl bg-[#FF4D6D] py-3.5 font-display text-sm text-white shadow-[0_10px_26px_rgba(255,77,109,0.4)]"
          >
            SÍ, ELIMINAR MI CUENTA
          </button>
        </form>

        <Link
          href="/perfil"
          className="w-full rounded-2xl bg-[#1F2038] py-3.5 text-center text-sm font-bold text-[#9195C2]"
        >
          No, cancelar
        </Link>
      </div>
    </PhoneFrame>
  );
}
