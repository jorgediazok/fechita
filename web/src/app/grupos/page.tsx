import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserGroups } from "@/lib/groups";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { createGroupAction, joinGroupAction } from "./actions";
import { VerifyEmailNudge } from "@/components/VerifyEmailNudge";
import { isEmailVerified } from "@/lib/emailVerification";

export const metadata: Metadata = {
  title: "Tus grupos",
  robots: { index: false, follow: false },
};

export default async function GruposPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  const verified = isEmailVerified(user);
  const myGroups = await getUserGroups(user._id);

  return (
    <PhoneFrame nav={<BottomNav active="grupos" />}>
        <div
          className="px-6 pt-5 pb-12"
          style={{
            background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
          }}
        >
          <div className="flex items-center justify-center text-white">
            <h1 className="font-display text-lg">MIS GRUPOS</h1>
          </div>
          <p className="mt-2 text-center text-[11px] font-extrabold text-white/70">
            Compartí un código con amigos y compitan aparte
          </p>
        </div>

        {!verified && <VerifyEmailNudge email={user.email} />}

        <div className="flex flex-col gap-2.5 px-4.5 pt-5">
          {myGroups.length === 0 && (
            <p className="px-1 text-xs font-bold text-[#8A8FB2]">
              Todavía no estás en ningún grupo. Creá uno o unite con un código.
            </p>
          )}

          {myGroups.map(({ group, memberCount }) => (
            <Link
              key={String(group._id)}
              href={`/grupos/${group._id}`}
              className="flex items-center gap-2.5 rounded-2xl bg-[#15162A] px-4 py-3.5"
            >
              <div className="flex-1">
                <div className="text-[13px] font-extrabold text-[#E4E6F7]">{group.name}</div>
                <div className="text-[11px] font-bold text-[#8A8FB2]">
                  {memberCount} {memberCount === 1 ? "integrante" : "integrantes"}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="#8A8FB2" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>

        {verified ? (
          <>
            <div className="mx-4.5 mt-5 flex flex-col gap-2.5 rounded-2xl bg-[#15162A] p-4">
              <h2 className="font-display text-xs tracking-wide text-[#8A8FB2]">CREAR GRUPO</h2>
              <form action={createGroupAction} className="flex items-center gap-2">
                <label htmlFor="group-name" className="sr-only">
                  Nombre del grupo
                </label>
                <input
                  id="group-name"
                  type="text"
                  name="name"
                  placeholder="Nombre del grupo"
                  required
                  autoComplete="off"
                  className="h-10 flex-1 rounded-xl bg-[#0B0C16] px-3 text-[13px] font-bold text-[#E4E6F7] shadow-[inset_0_0_0_1.5px_#262844] placeholder:text-[#8A8FB2]"
                />
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-gradient-to-br from-[#6845E0] to-[#9B5CFF] px-4 font-display text-[11px] text-white shadow-[0_6px_16px_rgba(124,92,255,0.4)]"
                >
                  CREAR
                </button>
              </form>
            </div>

            <div className="mx-4.5 mt-3 flex flex-col gap-2.5 rounded-2xl bg-[#15162A] p-4">
              <h2 className="font-display text-xs tracking-wide text-[#8A8FB2]">UNIRME CON CÓDIGO</h2>
              <form action={joinGroupAction} className="flex items-center gap-2">
                <label htmlFor="group-code" className="sr-only">
                  Código de invitación
                </label>
                <input
                  id="group-code"
                  type="text"
                  name="code"
                  placeholder="Ej. 8F3K2Q"
                  required
                  maxLength={6}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="h-10 flex-1 rounded-xl bg-[#0B0C16] px-3 text-[13px] font-bold uppercase tracking-widest text-[#E4E6F7] shadow-[inset_0_0_0_1.5px_#262844] placeholder:text-[#8A8FB2] placeholder:normal-case placeholder:tracking-normal"
                />
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-[#1F2038] px-4 font-display text-[11px] text-[#9195C2]"
                >
                  UNIRME
                </button>
              </form>
            </div>
          </>
        ) : (
          <p className="mx-4.5 mt-5 rounded-2xl bg-[#15162A] p-4 text-xs font-bold text-[#8A8FB2]">
            Confirmá tu email para crear un grupo o unirte con un código.
          </p>
        )}
    </PhoneFrame>
  );
}
