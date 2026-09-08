import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Grupo",
  robots: { index: false, follow: false },
};
import { connectToDatabase } from "@/lib/db";
import GroupModel from "@/models/Group";
import "@/models/Team"; // registra el schema para poder popular favoriteTeamId
import { getGroupLeaderboard } from "@/lib/groups";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TeamBadge, type BadgeTeam } from "@/components/TeamBadge";
import { BottomNav } from "@/components/BottomNav";
import { leaveGroupAction } from "../actions";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  await connectToDatabase();
  const group = await GroupModel.findById(id);
  if (!group) notFound();

  const ranked = await getGroupLeaderboard(group._id);
  const isMember = ranked.some((r) => String(r.user._id) === String(user._id));
  if (!isMember) redirect("/grupos");

  return (
    <PhoneFrame nav={<BottomNav active="grupos" />}>
        <div
          className="px-6 pt-5 pb-8"
          style={{
            background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
          }}
        >
          <div className="flex items-center justify-between text-[#0B0C16]">
            <Link href="/grupos" aria-label="Volver a mis grupos" className="rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="#0B0C16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="font-display text-lg">{group.name.toUpperCase()}</h1>
            <div className="w-5" />
          </div>
        </div>

        <div className="relative z-10 mx-5.5 -mt-3.5 flex items-center justify-between rounded-2xl bg-[#15162A] px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
          <div className="text-[11px] font-extrabold text-[#9195C2]">CÓDIGO DE INVITACIÓN</div>
          <div className="font-display text-lg tracking-widest text-[#7C5CFF]">{group.inviteCode}</div>
        </div>

        <div className="flex flex-col gap-1.5 px-5 py-4">
          {ranked.map((row, i) => {
            const isMe = String(row.user._id) === String(user._id);
            const team = row.user.favoriteTeamId as unknown as BadgeTeam | undefined;
            return (
              <div
                key={String(row.membership._id)}
                className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 ${
                  isMe ? "border-2 border-[#FF2D95] bg-[#23244A]" : "bg-[#15162A]"
                }`}
              >
                <div className="w-5 text-center font-display text-[15px] text-[#8A8FB2]">{i + 1}</div>
                {team ? <TeamBadge team={team} size={26} /> : <div className="h-[26px] w-[26px]" />}
                <div className="flex-1 text-[13px] font-extrabold text-[#E4E6F7]">{row.user.name}</div>
                {isMe && (
                  <div className="rounded-full bg-[#FF2D95] px-2 py-0.5 font-display text-[9px] text-[#0B0C16] shadow-[0_0_14px_rgba(255,45,149,0.55)]">
                    VOS
                  </div>
                )}
                <div className="font-display text-sm">{row.points}</div>
              </div>
            );
          })}
        </div>

        <div className="mx-4.5 mt-2">
          <form action={leaveGroupAction}>
            <input type="hidden" name="groupId" value={String(group._id)} />
            <button type="submit" className="rounded px-2 py-1.5 text-[11px] font-bold text-[#8A8FB2] underline">
              Salir del grupo
            </button>
          </form>
        </div>
    </PhoneFrame>
  );
}
