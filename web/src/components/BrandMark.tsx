// El ícono con símbolo: un banderín de córner (mástil + tela con una leve caída, como tela de
// verdad y no un triángulo rígido). La versión más ambiciosa (el banderín haciendo de "i" en
// la palabra "fechita") sigue pendiente de ejecutar a mano en vector — ver CLAUDE.md §
// "Nombre del proyecto". Esta es la versión "suelta", en dos variantes:
//
//  - "tile" (default): el banderín blanco sobre su propio cuadrado con el degradé de marca.
//    Para favicon/PWA (ver src/app/icon.svg y public/icon-*.png, generados del mismo dibujo)
//    y cualquier lugar sobre un fondo neutro (la app en sí, casi negro).
//  - "mark": solo el banderín, sin el cuadrado — para poner encima de una superficie que ya
//    tiene el degradé de marca (el header de /login, la landing), donde un cuadrado con el
//    mismo degradé encima se perdería contra el fondo.
export function BrandMark({
  size = 40,
  variant = "tile",
  className,
}: {
  size?: number;
  variant?: "tile" | "mark";
  className?: string;
}) {
  const flag = (
    <>
      <path d="M26 10 L26 53" stroke="#FFFFFF" strokeWidth={4.4} strokeLinecap="round" />
      <ellipse cx="26" cy="54.5" rx="5.3" ry="1.8" fill="#FFFFFF" opacity={0.5} />
      <path d="M26 12 Q 36 13.5, 45.5 20.5 Q 36 27, 26 27.5 Z" fill="#FFFFFF" />
    </>
  );

  if (variant === "mark") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
        {flag}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="brandmark-gradient" x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor="#6845E0" />
          <stop offset="55%" stopColor="#9B5CFF" />
          <stop offset="100%" stopColor="#FF4FC3" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#brandmark-gradient)" />
      {flag}
    </svg>
  );
}
