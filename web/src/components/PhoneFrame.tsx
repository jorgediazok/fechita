import { PushRegistrar } from "./PushClient";

export function PhoneFrame({
  children,
  nav,
  overlay,
}: {
  children: React.ReactNode;
  nav?: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-full bg-[#050608] md:flex md:h-screen md:items-center md:justify-center md:py-10">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#7C5CFF] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Saltar al contenido
      </a>
      <div
        id="phone-frame"
        className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden text-white md:h-[min(844px,calc(100vh-5rem))] md:rounded-[36px] md:shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:ring-1 md:ring-white/10"
        style={{
          backgroundColor: "#0B0C16",
          backgroundImage:
            "radial-gradient(520px circle at 8% -6%, rgba(124,92,255,0.28), transparent 55%), radial-gradient(460px circle at 104% 10%, rgba(255,79,195,0.20), transparent 50%)",
        }}
      >
        {/* El nav de abajo es un hermano del contenedor con scroll, no un hijo — si estuviera
            adentro, scrollearía junto con el contenido (el mismo motivo por el que un
            position:fixed no sirve acá: ancestro y contenedor con scroll no pueden ser
            el mismo elemento sin arrastrar al fixed con el scroll interno). */}
        <style>{`
          .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
          .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
        `}</style>
        <PushRegistrar />
        <main id="contenido" className="no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        {nav}
        {/* Igual que el nav, hermano del contenedor con scroll — así un overlay a pantalla
            completa (ej. anuncio de ascenso/descenso) no se corta ni se scrollea con el
            contenido de abajo. */}
        {overlay}
      </div>
    </div>
  );
}
