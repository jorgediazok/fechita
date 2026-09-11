import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y privacidad",
  description: "Términos de uso y política de privacidad.",
  alternates: { canonical: "/legal" },
};

type Section = { title: string; body: React.ReactNode };

// Separadas en dos grupos (con ancla propia) porque el consent screen de Google OAuth pide
// dos links distintos: "Application privacy policy link" y "Application Terms of Service
// link". Mismo documento, cada uno apunta a su mitad — ver README §Deploy.
const TERMS_SECTIONS: Section[] = [
  {
    title: "Es un juego de puntos, sin plata de por medio",
    body: (
      <>
        {SITE_NAME} es un prode: pronosticás resultados y sumás puntos, insignias y categoría
        dentro de la app. <b>No hay apuestas, no se cobra ni se paga nada, y los puntos no
        tienen valor monetario.</b>
      </>
    ),
  },
  {
    title: "Uso aceptable",
    body: (
      <>
        Tu cuenta es personal. No crear cuentas múltiples para manipular una liga o un grupo,
        ni usar bots o scripts propios para pronosticar en tu nombre. Nos reservamos el
        derecho de suspender cuentas que rompan esto.
      </>
    ),
  },
  {
    title: "Sin garantías",
    body: (
      <>
        {SITE_NAME} es un proyecto en desarrollo. Puede tener interrupciones, cambios, o
        eventualmente cerrar, sin que eso implique ningún compromiso de disponibilidad
        continua de nuestra parte.
      </>
    ),
  },
];

const PRIVACY_SECTIONS: Section[] = [
  {
    title: "Qué datos guardamos",
    body: (
      <>
        Nombre, mail, el club que elegiste como hincha, tu categoría de liga, tus
        pronósticos, y si activaste las notificaciones, la suscripción de tu navegador para
        mandártelas. Si te registraste con mail y contraseña, la contraseña se guarda
        encriptada (nunca en texto plano) y nosotros no podemos leerla. Si entraste con
        Google, no vemos ni guardamos ninguna contraseña tuya. Para frenar registros
        automatizados guardamos brevemente tu IP junto al intento de alta o login —se borra
        sola a la hora.
      </>
    ),
  },
  {
    title: "Con quién los compartimos",
    body: (
      <>
        Con nadie para publicidad ni marketing —no hay analytics de terceros ni se venden
        datos. Sí usamos proveedores para que la app funcione: <b>Google</b> (si elegís entrar
        con esa cuenta), <b>Resend</b> (para el mail de confirmación de cuenta) y la
        infraestructura donde vive la app (hosting y base de datos). Cada uno ve solo lo
        necesario para su parte.
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <>
        Una sola: la de sesión, para mantenerte logueado. Es técnica (httpOnly) —no hay
        cookies de tracking ni de terceros.
      </>
    ),
  },
  {
    title: "Tus datos son tuyos",
    body: (
      <>
        Podés borrar tu cuenta y todo lo asociado cuando quieras desde{" "}
        <b>Perfil → Eliminar cuenta</b>, o escribiéndonos.
      </>
    ),
  },
];

export default async function LegalPage() {
  const loggedIn = Boolean(await getCurrentUser());

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
          <h1 className="font-display text-lg">TÉRMINOS Y PRIVACIDAD</h1>
          <div className="w-5" />
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="rounded-2xl bg-[#15162A] p-4">
          <p className="text-[13px] font-medium leading-relaxed text-[#9195C2]">
            {SITE_NAME} está en desarrollo, hoy en prueba con un grupo chico de usuarios. Este
            texto es una primera versión, honesta sobre lo que hacemos hoy —se va a formalizar
            (con más detalle y, si hace falta, revisión legal) antes de abrir la app al
            público en general.
          </p>
        </div>

        <div id="terminos" className="mt-5 scroll-mt-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8A8FB2]">
            Términos de uso
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {TERMS_SECTIONS.map((s) => (
              <div key={s.title} className="rounded-2xl bg-[#15162A] p-4">
                <h2 className="font-display text-[15px] leading-tight text-[#E4E6F7]">
                  {s.title}
                </h2>
                <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#9195C2]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div id="privacidad" className="mt-5 scroll-mt-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8A8FB2]">
            Privacidad
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {PRIVACY_SECTIONS.map((s) => (
              <div key={s.title} className="rounded-2xl bg-[#15162A] p-4">
                <h2 className="font-display text-[15px] leading-tight text-[#E4E6F7]">
                  {s.title}
                </h2>
                <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#9195C2]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#15162A] p-4">
          <h2 className="font-display text-[15px] leading-tight text-[#E4E6F7]">Contacto</h2>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-[#9195C2]">
            Dudas, algo que no cuadra, o querés que borremos tus datos a mano:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#E4E6F7] underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
