import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { BadgeShowcase } from "@/components/BadgeShowcase";
import { getBadgeShowcase } from "@/lib/badges";
import { isMockMode as runningInMockMode } from "@/lib/api-football/source";
import { devReevaluateBadges, devResetBadges, devSimulateBadge } from "./actions";

export const metadata: Metadata = {
  title: "Insignias",
  robots: { index: false, follow: false },
};

const isMockMode = runningInMockMode();

export default async function InsigniasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.favoriteTeamId) redirect("/onboarding");

  const showcase = await getBadgeShowcase(user._id);
  const showcaseBadges = showcase.badges.map((b) => ({
    id: b.id,
    name: b.name,
    rarity: b.rarity,
    group: b.group,
    criterio: b.criterio,
    flavor: b.flavor,
    earned: b.earned,
    earnedAt: b.earnedAt ? new Date(b.earnedAt).toISOString() : null,
  }));

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
          <h1 className="font-display text-lg">INSIGNIAS</h1>
          <div className="w-5" />
        </div>
      </div>

      <p className="mx-5.5 mt-3 text-[11px] font-bold leading-relaxed text-[#8A8FB2]">
        Son permanentes: una vez que la ganás, queda para siempre aunque después bajes de
        categoría. Tocá cualquiera para ver cómo se consigue.
      </p>

      <BadgeShowcase
        badges={showcaseBadges}
        earnedCount={showcase.earnedCount}
        total={showcase.total}
      />

      {isMockMode && (
        <div className="mx-4.5 my-5 rounded-2xl border border-dashed border-[#7C5CFF]/50 p-3.5 text-sm">
          <p className="mb-2 font-bold text-[#B9BCDA]">Panel dev (insignias)</p>
          <div className="flex flex-wrap gap-2">
            <form action={devSimulateBadge}>
              <button type="submit" className="rounded-xl bg-[#1F2038] px-3 py-1.5 text-xs font-bold text-[#A390FF]">
                Probar festejo
              </button>
            </form>
            <form action={devReevaluateBadges}>
              <button type="submit" className="rounded-xl bg-[#1F2038] px-3 py-1.5 text-xs font-bold text-[#9195C2]">
                Reevaluar insignias
              </button>
            </form>
            <form action={devResetBadges}>
              <button type="submit" className="rounded-xl bg-[#1F2038] px-3 py-1.5 text-xs font-bold text-[#FF4D6D]">
                Resetear insignias
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="h-6" />
    </PhoneFrame>
  );
}
