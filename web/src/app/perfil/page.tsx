import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import "@/models/Team"; // registra el schema para poder popular favoriteTeamId
import { PhoneFrame } from "@/components/PhoneFrame";
import { TeamBadge, type BadgeTeam } from "@/components/TeamBadge";
import { BottomNav } from "@/components/BottomNav";
import { getBadgeShowcase } from "@/lib/badges";
import { getCareerStats, bestTierOf } from "@/lib/profile";
import { TIER_FULL_NAMES, type TierCode } from "@/lib/leagues";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL, APP_VERSION } from "@/lib/site";
import { ShareButton } from "@/components/ShareButton";
import { PushToggle } from "@/components/PushClient";
import { logoutAction } from "./actions";

const memberSinceFmt = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });

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

  const { earnedCount, total } = await getBadgeShowcase(user._id);
  const stats = await getCareerStats(user._id);
  const currentTier = (user.currentTier ?? "D") as TierCode;
  const techoTier = bestTierOf(user);
  const memberSince = user.createdAt ? memberSinceFmt.format(new Date(user.createdAt)) : null;
  const shareText = `Llevo ${stats.totalPoints} puntos y ${earnedCount} insignias en ${SITE_NAME}. Mi categoría: ${TIER_FULL_NAMES[currentTier]}.`;

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
            {memberSince && (
              <p className="mt-0.5 text-[10px] font-bold text-[#57628A]">Jugás desde {memberSince}</p>
            )}
          </div>
          <Link
            href="/perfil/equipo"
            className="rounded-full bg-[#1F2038] px-4 py-1.5 text-[11px] font-bold text-[#9195C2]"
          >
            Cambiar de club
          </Link>
        </div>

        {/* categoría — "estar en Primera es el flex", ver docs/product-design.md */}
        <div
          className="mx-4.5 mt-4 flex items-center gap-3.5 rounded-2xl px-4 py-4"
          style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 60%, #FF4FC3)" }}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 2l2.6 6.6L21 9.2l-5 4.4 1.5 6.9L12 17l-5.5 3.5L8 13.6 3 9.2l6.4-.6L12 2z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold tracking-wide text-white/70">TU CATEGORÍA</p>
            <p className="font-display text-lg leading-tight text-white">
              {TIER_FULL_NAMES[currentTier].toUpperCase()}
            </p>
            {techoTier !== currentTier && (
              <p className="text-[10px] font-bold text-white/70">
                Tu techo: {TIER_FULL_NAMES[techoTier]}
              </p>
            )}
          </div>
        </div>

        <div className="mx-4.5 mt-2.5 flex items-center gap-2 rounded-xl bg-[#15162A] px-3.5 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2c1.1 3.1-1.6 4.7-1.6 7.4 0 1.4 1 2.3 1 2.3s2.7-2.1 2.2-4.8c2.1 2.1 3.7 4.8 3.7 7.8A5.3 5.3 0 0 1 6.7 15C6.7 10.3 11 8.1 12 2z"
              fill={stats.currentStreak > 0 ? "#FF7A3D" : "#3A3D5C"}
            />
          </svg>
          {stats.currentStreak > 0 ? (
            <>
              <span className="text-[12px] font-extrabold text-[#E4E6F7]">
                Racha de {stats.currentStreak} {stats.currentStreak === 1 ? "fecha" : "fechas"}
              </span>
              <span className="ml-auto text-[10px] font-bold text-[#8A8FB2]">
                acertándole a la mayoría
              </span>
            </>
          ) : (
            <span className="text-[12px] font-bold text-[#8A8FB2]">
              Sin racha — cerrá una fecha con +50% de aciertos para arrancarla
            </span>
          )}
        </div>

        <div className="mx-4.5 mt-4 flex flex-col gap-2.5">
          <Link
            href="/perfil/carrera"
            className="flex items-center gap-3 rounded-2xl bg-[#15162A] px-4 py-3.5"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F2038]"
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 20V10M12 20V4M20 20v-7" stroke="#A390FF" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="flex-1 text-sm font-bold text-[#E4E6F7]">Mi carrera</span>
            <span className="text-[12px] font-extrabold text-[#8A8FB2]">{stats.totalPoints} pts</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="#57628A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link
            href="/perfil/insignias"
            className="flex items-center gap-3 rounded-2xl bg-[#15162A] px-4 py-3.5"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(145deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l7 4v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V7l7-4z"
                  fill="#FFFFFF"
                />
                <path
                  d="M9.2 12.2l2 2 3.6-3.8"
                  stroke="#6845E0"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="flex-1 text-sm font-bold text-[#E4E6F7]">Insignias</span>
            <span className="text-[12px] font-extrabold text-[#8A8FB2]">
              {earnedCount} / {total}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="#57628A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <PushToggle />

          <Link
            href="/reglas"
            className="flex items-center gap-3 rounded-2xl bg-[#15162A] px-4 py-3.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F2038]" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9.2 9a2.8 2.8 0 1 1 3.9 2.6c-.9.4-1.6 1.2-1.6 2.2v.4"
                  stroke="#A390FF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="11.5" cy="18" r="1.3" fill="#A390FF" />
              </svg>
            </span>
            <span className="flex-1 text-sm font-bold text-[#E4E6F7]">Cómo se juega</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="#57628A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <ShareButton text={shareText} url={SITE_URL} />

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${SITE_NAME} — sugerencia / problema`)}`}
            className="w-full rounded-2xl bg-[#1F2038] py-3.5 text-center text-sm font-bold text-[#9195C2]"
          >
            Sugerencias o un problema
          </a>

          <form action={logoutAction}>
            <button type="submit" className="w-full rounded-2xl bg-[#1F2038] py-3.5 text-sm font-bold text-[#9195C2]">
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="mx-4.5 mt-6 flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold text-[#57628A]">
            <Link href="/legal" className="underline">Términos y privacidad</Link>
            {" · "}v{APP_VERSION}
          </p>
          <Link href="/perfil/eliminar" className="rounded px-2 py-1 text-xs font-bold text-[#FF4D6D] underline">
            Eliminar cuenta
          </Link>
        </div>
    </PhoneFrame>
  );
}
