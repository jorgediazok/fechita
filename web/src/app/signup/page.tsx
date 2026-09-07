import { connectToDatabase } from "@/lib/db";
import TeamModel from "@/models/Team";
import { PhoneFrame } from "@/components/PhoneFrame";
import { signupAction } from "./actions";

type LeanTeam = { _id: string; name: string; shortName: string; logoUrl: string };

export default async function SignupPage() {
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
          <h1 className="font-display text-[28px] leading-none text-[#0B0C16]">
            CREAR CUENTA
          </h1>
          <p className="text-center text-[13px] font-bold text-[#0B0C16]/70">
            Pronosticá. Sumá puntos. Bancá a tu club.
          </p>
        </div>
      </div>

      <form action={signupAction} className="flex flex-col gap-6 px-7 py-7">
        <div className="flex flex-col gap-3">
          <input
            name="name"
            placeholder="Tu nombre"
            required
            className="w-full rounded-2xl border-2 border-[#2A2C48] bg-[#15162A] px-4 py-3.5 text-base font-extrabold text-white outline-none placeholder:text-[#6B6F94]"
          />
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
            placeholder="Contraseña (mínimo 6 caracteres)"
            required
            minLength={6}
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
          CREAR CUENTA
        </button>
      </form>
    </PhoneFrame>
  );
}
