import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/db";
import TeamModel from "@/models/Team";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ClubPicker } from "@/components/ClubPicker";
import { BottomNav } from "@/components/BottomNav";
import { changeFavoriteTeam } from "./actions";

type LeanTeam = { _id: string; name: string; shortName: string; logoUrl: string };

export const metadata: Metadata = {
  title: "Cambiar de club",
  robots: { index: false, follow: false },
};

export default async function CambiarClubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  await connectToDatabase();
  const teams = (await TeamModel.find({}).sort({ name: 1 }).lean()) as unknown as LeanTeam[];
  const currentTeamId = String(user.favoriteTeamId);

  return (
    <PhoneFrame nav={<BottomNav active="perfil" />}>
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
          <h1 className="font-display text-lg">CAMBIAR DE CLUB</h1>
          <div className="w-5" />
        </div>
      </div>

      <form action={changeFavoriteTeam} className="flex flex-col gap-6 px-7 py-7">
        <ClubPicker teams={teams} selectedId={currentTeamId} legend="Elegí tu nuevo club" />

        <button
          type="submit"
          className="mt-1 rounded-2xl py-4 font-display text-lg tracking-wide text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)]"
          style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
        >
          GUARDAR
        </button>
      </form>
    </PhoneFrame>
  );
}
