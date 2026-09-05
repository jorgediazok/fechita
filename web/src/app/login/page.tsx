import { connectToDatabase } from "@/lib/db";
import TeamModel from "@/models/Team";
import { PhoneFrame } from "@/components/PhoneFrame";
import { pickUser } from "./actions";

type LeanTeam = { _id: string; name: string; shortName: string; logoUrl: string };

export default async function LoginPage() {
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

      <form action={pickUser} className="flex flex-col gap-6 px-7 py-7">
        <div className="flex flex-col gap-2">
          <label className="font-display text-sm tracking-wide">
            ¿CÓMO TE LLAMAMOS?
          </label>
          <input
            name="name"
            placeholder="Tu nombre"
            required
            className="w-full rounded-2xl border-2 border-[#2A2C48] bg-[#15162A] px-4 py-3.5 text-base font-extrabold text-white outline-none placeholder:text-[#6B6F94]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-display text-sm tracking-wide">
            ELEGÍ TU CLUB
          </span>
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {teams.map((team, i) => (
              <label key={String(team._id)} className="flex cursor-pointer flex-col items-center gap-1.5">
                <input
                  type="radio"
                  name="clubId"
                  value={String(team._id)}
                  defaultChecked={i === 0}
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
        </div>

        <button
          type="submit"
          className="mt-1 rounded-2xl py-4 font-display text-lg tracking-wide text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)]"
          style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
        >
          ARRANCAR
        </button>

        <p className="text-center text-xs font-bold text-[#6B6F94]">
          Sin contraseña. Es gratis, siempre.
        </p>
      </form>
    </PhoneFrame>
  );
}
