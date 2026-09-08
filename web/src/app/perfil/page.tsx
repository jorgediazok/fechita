import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import "@/models/Team"; // registra el schema para poder popular favoriteTeamId
import { PhoneFrame } from "@/components/PhoneFrame";
import { TeamBadge, type BadgeTeam } from "@/components/TeamBadge";
import { BottomNav } from "@/components/BottomNav";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Tu perfil",
  robots: { index: false, follow: false },
};

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  await user.populate("favoriteTeamId", "name shortName logoUrl");
  const team = user.favoriteTeamId as unknown as BadgeTeam;

  return (
    <PhoneFrame nav={<BottomNav active="perfil" />}>
        <div
          className="px-6 pt-5 pb-12"
          style={{
            background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
          }}
        >
          <div className="flex items-center justify-center text-white">
            <h1 className="font-display text-lg">PERFIL</h1>
          </div>
        </div>

        <div className="mx-4.5 mt-4 flex flex-col items-center gap-3 rounded-2xl bg-[#15162A] px-4 py-6 shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
          <TeamBadge team={team} size={64} />
          <div className="text-center">
            <p className="font-display text-lg text-[#E4E6F7]">{user.name}</p>
            <p className="text-[11px] font-bold text-[#8A8FB2]">{user.email}</p>
          </div>
          <Link
            href="/perfil/equipo"
            className="rounded-full bg-[#1F2038] px-4 py-1.5 text-[11px] font-bold text-[#9195C2]"
          >
            Cambiar de club
          </Link>
        </div>

        <div className="mx-4.5 mt-4">
          <form action={logoutAction}>
            <button type="submit" className="w-full rounded-2xl bg-[#1F2038] py-3.5 text-sm font-bold text-[#9195C2]">
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="mx-4.5 mt-6 flex justify-center">
          <Link href="/perfil/eliminar" className="rounded px-2 py-1 text-xs font-bold text-[#FF4D6D] underline">
            Eliminar cuenta
          </Link>
        </div>
    </PhoneFrame>
  );
}
