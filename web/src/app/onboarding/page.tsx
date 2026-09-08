import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/db";
import TeamModel from "@/models/Team";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ClubPicker } from "@/components/ClubPicker";
import { setFavoriteTeam } from "./actions";

type LeanTeam = { _id: string; name: string; shortName: string; logoUrl: string };

export const metadata: Metadata = {
  title: "Elegí tu club",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.favoriteTeamId) redirect("/pronosticos");

  await connectToDatabase();
  const teams = (await TeamModel.find({}).sort({ name: 1 }).lean()) as unknown as LeanTeam[];

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
          <h1 className="font-display text-[26px] leading-tight text-[#0B0C16]">
            ¿DE QUÉ CUADRO SOS?
          </h1>
          <p className="text-center text-[13px] font-bold text-[#0B0C16]/70">
            Un último paso antes de arrancar
          </p>
        </div>
      </div>

      <form action={setFavoriteTeam} className="flex flex-col gap-6 px-7 py-7">
        <ClubPicker teams={teams} legend="Elegí tu club" />

        <button
          type="submit"
          className="mt-1 rounded-2xl py-4 font-display text-lg tracking-wide text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)]"
          style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
        >
          ARRANCAR
        </button>
      </form>
    </PhoneFrame>
  );
}
