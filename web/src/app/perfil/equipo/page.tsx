import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/db";
import TeamModel from "@/models/Team";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { changeFavoriteTeam } from "./actions";

type LeanTeam = { _id: string; name: string; shortName: string; logoUrl: string };

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
          <Link href="/perfil">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="font-display text-lg">CAMBIAR DE CLUB</div>
          <div className="w-5" />
        </div>
      </div>

      <form action={changeFavoriteTeam} className="flex flex-col gap-6 px-7 py-7">
        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {teams.map((team) => (
            <label key={String(team._id)} className="flex cursor-pointer flex-col items-center gap-1.5">
              <input
                type="radio"
                name="clubId"
                value={String(team._id)}
                defaultChecked={String(team._id) === currentTeamId}
                className="peer sr-only"
              />
              <span className="flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full bg-[#15162A] shadow-[0_0_0_2px_#2A2C48] peer-checked:shadow-[0_0_0_3px_#7C5CFF] peer-checked:[filter:drop-shadow(0_0_10px_rgba(124,92,255,0.65))] peer-checked:-rotate-6 transition-transform">
                {team.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.logoUrl} alt="" className="h-9 w-9 object-contain" />
                ) : (
                  <span className="text-xs font-extrabold text-[#6B6F94]">
                    {team.shortName.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="text-center text-[10px] font-extrabold text-[#9195C2] peer-checked:text-[#7C5CFF]">
                {team.shortName}
              </span>
            </label>
          ))}
        </div>

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
