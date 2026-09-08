import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { qrSvg } from "@/lib/qr";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} · Prode de fútbol argentino` },
  alternates: { canonical: "/" },
};

const FEATURES = [
  {
    title: "Liga semanal",
    body: "Cada semana competís en un grupo de tu categoría. Los que más aciertan suben, los últimos bajan.",
    icon: (
      <path d="M4 21V10M12 21V3M20 21v-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    ),
  },
  {
    title: "Grupos con amigos",
    body: "Armá un grupo con un código y llevá la tabla aparte con tu banda, la oficina o el grupo del asado.",
    icon: (
      <>
        <circle cx="8.5" cy="8" r="3" stroke="currentColor" strokeWidth="2.1" />
        <circle cx="16.5" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="2.1" />
        <path d="M3 20c0-3.4 2.6-5.5 5.5-5.5S14 16.6 14 20" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M14.8 14.8c2.5.2 4.2 2 4.2 5.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Ascensos y descensos",
    body: "De la Primera D a la Primera División. No es un ranking eterno: se pelea cada semana.",
    icon: (
      <>
        <path d="M4 20h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M7 20V9l5-5 5 5v11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 4v6M9 8l3-3 3 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/pronosticos");

  const qr = await qrSvg(`${SITE_URL}/login`);

  return (
    <div className="min-h-dvh overflow-hidden bg-[#0B0C16] text-[#E4E6F7]">
      <style>{`
        @keyframes lp-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes lp-glow { 0%, 100% { opacity: 0.45; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.06); } }
        .lp-in { animation: lp-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .lp-float { animation: lp-float 7s ease-in-out infinite; }
        .lp-glow { animation: lp-glow 5s ease-in-out infinite; }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(760px circle at 10% -10%, rgba(124,92,255,0.24), transparent 55%), radial-gradient(680px circle at 100% 5%, rgba(255,79,195,0.18), transparent 52%)",
        }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-6 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0B0C16]">
              <svg width="18" height="18" viewBox="0 -960 960 960" fill="#FFFFFF" aria-hidden="true">
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm200-500 54-18 16-54q-32-48-77-82.5T574-786l-54 38v56l160 112Zm-400 0 160-112v-56l-54-38q-54 17-99 51.5T210-652l16 54 54 18Zm-42 308 46-4 30-54-58-174-56-20-40 30q0 65 18 118.5T238-272Zm293 108q25-4 49-12l28-60-26-44H378l-26 44 28 60q24 8 49 12t51 4q26 0 51-4ZM390-360h180l56-160-146-102-144 102 54 160Zm332 88q42-50 60-103.5T800-494l-40-28-56 18-58 174 30 54 46 4Z" />
              </svg>
            </span>
            <span className="font-display text-lg tracking-wide">{SITE_NAME.toUpperCase()}</span>
          </div>
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-extrabold text-[#A390FF] hover:text-white">
            Entrar
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-8 [@media(min-height:1250px)]:justify-start [@media(min-height:1250px)]:pt-[12vh]">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12">
            <div className="lp-in text-center md:text-left">
              <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">
                El prode del fútbol argentino,{" "}
                <span className="block">con liga semanal.</span>
              </h1>
              <p className="mt-4 max-w-lg text-base font-bold text-[#9195C2] mx-auto md:mx-0">
                Pronosticá la fecha, sumá puntos y subí de categoría compitiendo contra otros hinchas.
                Sin plata de por medio — solo por el orgullo.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  href="/signup"
                  className="rounded-2xl px-6 py-3 font-display text-base tracking-wide text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)]"
                  style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
                >
                  CREAR CUENTA
                </Link>
                <Link
                  href="/login"
                  className="rounded-2xl border-2 border-[#2A2C48] px-6 py-3 font-display text-base tracking-wide text-white hover:border-[#7C5CFF]"
                >
                  YA TENGO CUENTA
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 md:justify-start">
                <div
                  className="h-16 w-16 shrink-0 rounded-lg bg-white p-1 [&_svg]:h-full [&_svg]:w-full"
                  // El SVG lo genera la librería qrcode a partir de SITE_URL, no de input de usuario.
                  dangerouslySetInnerHTML={{ __html: qr }}
                />
                <p className="text-xs font-bold text-[#8A8FB2]">
                  Escaneá para abrirla en tu celular.
                  <br />
                  Una vez adentro, agregala a la pantalla de inicio.
                </p>
              </div>
            </div>

            <div className="lp-in relative mx-auto" style={{ animationDelay: "120ms" }}>
              <div
                className="lp-glow absolute -inset-6 rounded-[48px]"
                style={{ background: "radial-gradient(circle, rgba(124,92,255,0.35), transparent 70%)" }}
              />
              <PhoneMock />
            </div>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <li
                key={f.title}
                className="lp-in rounded-2xl bg-[#15162A] p-4 text-center sm:text-left"
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto text-[#A390FF] sm:mx-0" aria-hidden="true">
                  {f.icon}
                </svg>
                <h2 className="mt-2.5 font-display text-base">{f.title}</h2>
                <p className="mt-1.5 text-[13px] font-bold leading-relaxed text-[#9195C2]">{f.body}</p>
              </li>
            ))}
          </ul>
        </main>

        <footer className="border-t border-[#1F2038] pt-5 text-xs font-bold text-[#8A8FB2]">
          {SITE_NAME} · Hecho para el hincha argentino.
        </footer>
      </div>
    </div>
  );
}

function PhoneMock() {
  return (
    <div className="lp-float relative w-60 overflow-hidden rounded-[34px] bg-[#0B0C16] p-2.5 shadow-[0_40px_90px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
      <div className="overflow-hidden rounded-[26px]">
        {/* hero */}
        <div
          className="px-4 pb-7 pt-5"
          style={{
            background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
          }}
        >
          <div className="rounded-2xl bg-[rgba(11,12,22,0.42)] p-3 backdrop-blur">
            <div className="text-[9px] font-extrabold tracking-wide text-[#F5F5FF]">TOMI · 47 PTS</div>
            <div className="mt-1.5 flex items-center justify-center gap-2.5">
              <div className="font-display text-[34px] leading-none text-white">4°</div>
              <div className="text-left">
                <div className="text-[8px] font-extrabold tracking-wide text-[#F5F5FF]">DE 11 · PRIMERA C</div>
                <div className="text-[8px] font-extrabold text-[#F5F5FF]/60">47 pts esta semana</div>
              </div>
            </div>
            <div className="relative mt-2.5 h-2 rounded-full bg-white/15">
              <div className="absolute left-0 h-full w-[27%] rounded-l-full bg-white/25" />
              <div className="absolute right-0 h-full w-[27%] rounded-r-full bg-[#FF2D95]/40" />
              <div
                className="absolute -top-1 h-4 w-4 rounded-full border-2 border-white bg-[#0B0C16]"
                style={{ left: "33%" }}
              />
            </div>
          </div>
        </div>

        {/* mini tabla */}
        <div className="-mt-3 flex flex-col gap-1.5 px-3 pb-3">
          {[
            { pos: 3, name: "Nacho", pts: 52, me: false, zone: "up" as const },
            { pos: 4, name: "Vos", pts: 47, me: true, zone: "mid" as const },
            { pos: 5, name: "Delfi", pts: 44, me: false, zone: "mid" as const },
          ].map((r) => (
            <div
              key={r.pos}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 ${
                r.me ? "bg-[#23244A] shadow-[inset_0_0_0_1.5px_#7C5CFF]" : "bg-[#15162A]"
              }`}
            >
              <span
                className={`w-3 text-center font-display text-[11px] ${
                  r.zone === "up" ? "text-[#4FD17F]" : "text-[#8A8FB2]"
                }`}
              >
                {r.pos}
              </span>
              <span className="flex-1 text-[11px] font-extrabold text-[#E4E6F7]">{r.name}</span>
              <span className="font-display text-[11px] text-[#9195C2]">{r.pts}</span>
            </div>
          ))}
        </div>

        {/* partido */}
        <div className="mx-3 mb-4 rounded-xl bg-[#15162A] p-3">
          <div className="flex items-center justify-between text-[10px] font-extrabold text-[#B9BCDA]">
            <span>River</span>
            <span className="text-[#8A8FB2]">vs.</span>
            <span>Boca</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {[
              { l: "L", on: true },
              { l: "E", on: false },
              { l: "V", on: false },
            ].map((b) => (
              <div
                key={b.l}
                className={`flex-1 rounded-lg py-1.5 text-center font-display text-[11px] ${
                  b.on ? "text-white" : "bg-[#1F2038] text-[#9195C2]"
                }`}
                style={b.on ? { background: "linear-gradient(135deg, #6845E0, #9B5CFF)" } : undefined}
              >
                {b.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
