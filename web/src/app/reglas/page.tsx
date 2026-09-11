import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(
  _props: PageProps<"/reglas">,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return pageMetadata(parent, {
    title: "Cómo se juega",
    description:
      "Las reglas del prode: cómo se cargan los pronósticos, cómo se suman puntos y cómo funciona la liga por fecha con ascensos y descensos.",
    path: "/reglas",
  });
}

type Rule = { n: string; title: string; body: React.ReactNode };

const RULES: Rule[] = [
  {
    n: "01",
    title: "Cargás tu pronóstico de cada partido",
    body: (
      <>
        Para cada partido de la fecha elegís <b>quién gana</b>: local, empate o visitante (las
        fichas <b>1&nbsp;·&nbsp;X&nbsp;·&nbsp;2</b>, como en la quiniela). Si te animás, podés
        además arriesgar el <b>resultado exacto</b> para ir por el bonus. La carga se cierra
        cuando arranca cada partido.
      </>
    ),
  },
  {
    n: "02",
    title: "Sumás 5, 3 o 0 puntos por partido",
    body: (
      <>
        <b>5 puntos</b> si clavaste el resultado exacto. <b>3 puntos</b> si acertaste quién
        ganaba (o el empate) aunque no el marcador. <b>0</b> si erraste. Si un partido se
        suspende y no se reprograma, va <b>1 punto</b> para todos los que habían pronosticado.
      </>
    ),
  },
  {
    n: "03",
    title: "Competís en una liga por fecha",
    body: (
      <>
        No hay un ranking gigante de todo el país. Estás en un <b>grupo de ~24</b> hinchas
        (de clubes distintos, a propósito) y competís fecha a fecha. Hay cinco categorías,
        con los nombres del ascenso argentino:{" "}
        <b>Primera&nbsp;D → C → B → Nacional → Primera División</b>. Todos arrancan en la D.
      </>
    ),
  },
  {
    n: "04",
    title: "Cada fecha subís o bajás de categoría",
    body: (
      <>
        Al terminar la fecha, el <b>~25% de arriba</b> de tu grupo asciende de categoría y el
        <b> ~25% de abajo</b> desciende. El resto se mantiene. El <b>#1</b> de cada grupo es
        el <b>ganador de la fecha</b>. Desde la D no se baja y desde Primera no se sube: ahí
        está la élite de la app.
      </>
    ),
  },
  {
    n: "05",
    title: "Grupos privados con tus amigos",
    body: (
      <>
        Aparte de la liga, podés armar un <b>grupo privado</b> y pasarle el código a tus
        amigos. Ahí el ranking es de <b>puntos totales históricos</b> —una competencia de
        largo plazo, no se resetea cada fecha.
      </>
    ),
  },
  {
    n: "06",
    title: "Insignias y bots",
    body: (
      <>
        Vas ganando <b>insignias permanentes</b> por aciertos acumulados, rachas, ascensos y
        hitos (quedan aunque después bajes). Y mientras haya poca gente real, algunos rivales
        son <b>bots</b> que pronostican solos —van siempre marcados con un cartel{" "}
        <b>BOT</b>, no son trampa.
      </>
    ),
  },
  {
    n: "07",
    title: "Trivia diaria",
    body: (
      <>
        Una pregunta nueva de cultura futbolera por día. Cada acierto suma{" "}
        <b>1 punto a tu fecha en curso</b>, con un tope de <b>5 puntos extra por fecha</b>
        {" "}(para que el ascenso siga siendo sobre todo de acertar partidos, no de trivia). Los
        aciertos de más ya no suman a la liga, pero siguen contando para tus{" "}
        <b>insignias de trivia</b>, sin límite.
      </>
    ),
  },
];

export default async function ReglasPage() {
  const user = await getCurrentUser();
  const loggedIn = Boolean(user);

  return (
    <PhoneFrame nav={loggedIn ? <BottomNav active="perfil" /> : undefined}>
      <div
        className="px-6 pt-5 pb-9"
        style={{
          background: "linear-gradient(150deg, #6845E0 0%, #9B5CFF 55%, #FF4FC3 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between text-white">
          <Link href={loggedIn ? "/perfil" : "/"} aria-label="Volver" className="rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="font-display text-lg">CÓMO SE JUEGA</h1>
          <div className="w-5" />
        </div>
        <p className="mt-3 text-[13px] font-bold leading-relaxed text-white/85">
          Un prode de fútbol argentino en el que no competís contra todo el país, sino contra
          tu grupo —y cada fecha subís o bajás de categoría.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-5 py-5">
        {RULES.map((r) => (
          <div key={r.n} className="rounded-2xl bg-[#15162A] p-4">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-sm text-[#7C5CFF]">{r.n}</span>
              <h2 className="font-display text-[15px] leading-tight text-[#E4E6F7]">{r.title}</h2>
            </div>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#9195C2]">{r.body}</p>
          </div>
        ))}

        {!loggedIn && (
          <Link
            href="/signup"
            className="mt-2 rounded-2xl py-4 text-center font-display text-lg tracking-wide text-white shadow-[0_10px_28px_rgba(124,92,255,0.4)]"
            style={{ background: "linear-gradient(135deg, #6845E0, #9B5CFF 55%, #FF4FC3)" }}
          >
            CREAR MI CUENTA
          </Link>
        )}
      </div>
    </PhoneFrame>
  );
}
