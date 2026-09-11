// Catálogo de insignias, en código (sin DB) — igual que las categorías de liga en
// lib/tiers.ts. Cada insignia tiene su arte (motif = SVG interno, 0 0 24 24, currentColor),
// su rareza (marco de color, como en Duolingo) y el texto del criterio para la pantalla de
// perfil y el festejo. La lógica de si un usuario la ganó vive en lib/badges/award.ts.

export type BadgeRarity = "bronce" | "plata" | "oro" | "marca";

export type BadgeGroup = "aciertos" | "rachas" | "exactos" | "trivia" | "ascensos" | "hitos" | "meta";

export type BadgeDef = {
  id: string;
  group: BadgeGroup;
  name: string;
  rarity: BadgeRarity;
  flavor: string;
  criterio: string;
  motif: string;
};

export const RARITY: Record<
  BadgeRarity,
  { label: string; ring: string; face: string; glow: string }
> = {
  bronce: {
    label: "Bronce",
    ring: "linear-gradient(145deg, #f0a56e, #a75e38)",
    face: "radial-gradient(circle at 50% 34%, #241f2c, #120f1c 72%)",
    glow: "rgba(224, 145, 94, 0.5)",
  },
  plata: {
    label: "Plata",
    ring: "linear-gradient(145deg, #e4e9f2, #8a93a6)",
    face: "radial-gradient(circle at 50% 34%, #1f2436, #10131f 72%)",
    glow: "rgba(199, 206, 221, 0.42)",
  },
  oro: {
    label: "Oro",
    ring: "linear-gradient(145deg, #ffe08a, #c99628)",
    face: "radial-gradient(circle at 50% 34%, #2a2616, #141207 72%)",
    glow: "rgba(245, 196, 81, 0.5)",
  },
  marca: {
    label: "Marca",
    ring: "linear-gradient(145deg, #6845e0 0%, #9b5cff 52%, #ff4fc3 100%)",
    face: "radial-gradient(circle at 50% 34%, #251a44, #120f26 72%)",
    glow: "rgba(155, 92, 255, 0.55)",
  },
};

export const GROUP_LABELS: Record<BadgeGroup, string> = {
  aciertos: "Aciertos acumulados",
  rachas: "Rachas",
  exactos: "Resultados exactos",
  trivia: "Trivia diaria",
  ascensos: "Ascensos",
  hitos: "Hitos",
  meta: "La última",
};

// ── motifs ───────────────────────────────────────────────────────────────────
const ball =
  '<circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<path d="M12 7.4l3.4 2.5-1.3 4h-4.2l-1.3-4z" fill="currentColor"/>' +
  '<path d="M12 3.6v3.8M4.6 9.2l3.3 1.2M7.6 19.4l1.4-3M16.4 19.4l-1.4-3M19.4 9.2l-3.3 1.2" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>';

const ballFast =
  '<g transform="translate(2.2 0)">' +
  '<circle cx="13" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<path d="M13 8l2.8 2-1 3.3h-3.5l-1-3.3z" fill="currentColor"/></g>' +
  '<path d="M2 9h5M1 12.2h4.4M2.4 15.4h3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>';

const eye =
  '<path d="M2 12s3.9-6.2 10-6.2S22 12 22 12s-3.9 6.2-10 6.2S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<circle cx="12" cy="12" r="3.5" fill="currentColor"/>' +
  '<circle cx="13.3" cy="10.7" r="1.05" fill="#12101f"/>';

const star =
  '<path d="M12 2l2.7 6.3 6.8 0.6-5.1 4.4 1.6 6.6L12 16.6 5.9 20.5l1.6-6.6L2.5 9.5l6.8-0.6z" fill="currentColor"/>' +
  '<circle cx="12" cy="11.4" r="2.5" fill="#12101f"/>';

const flame =
  '<path d="M12 2c1.1 3.1-1.6 4.7-1.6 7.4 0 1.4 1 2.3 1 2.3s2.7-2.1 2.2-4.8c2.1 2.1 3.7 4.8 3.7 7.8A5.3 5.3 0 0 1 6.7 15C6.7 10.3 11 8.1 12 2z" fill="currentColor"/>';

const flameDouble =
  '<path d="M8.4 4c0.8 2.3-1.2 3.5-1.2 5.5 0 1 0.7 1.7 0.7 1.7s2-1.5 1.7-3.5c1.5 1.5 2.6 3.5 2.6 5.7A3.9 3.9 0 0 1 4.6 12C4.6 8.6 7.7 6.9 8.4 4z" fill="currentColor" opacity="0.75"/>' +
  '<path d="M15 3c1 2.9-1.5 4.4-1.5 6.9 0 1.3 0.9 2.1 0.9 2.1s2.5-1.9 2-4.4c1.9 1.9 3.3 4.4 3.3 7.1A4.85 4.85 0 0 1 10 15c0-4.3 3.9-6.3 5-12z" fill="currentColor"/>';

const flameStar =
  '<path d="M11 5c1 2.9-1.5 4.4-1.5 6.9 0 1.3 0.9 2.1 0.9 2.1s2.5-1.9 2-4.4c1.9 1.9 3.3 4.4 3.3 7.1A4.85 4.85 0 0 1 6 16C6 11.7 10 9.7 11 5z" fill="currentColor"/>' +
  '<path d="M18 2.5l0.9 2 2.1 0.2-1.6 1.4 0.5 2.1L18 7.1l-1.9 1.1 0.5-2.1L15 4.7l2.1-0.2z" fill="currentColor"/>';

const cup =
  '<path d="M7 4h10v2.2a5 5 0 0 1-10 0z" fill="currentColor"/>' +
  '<path d="M17 4.6h2.6a2.6 2.6 0 0 1-2.8 3.9M7 4.6H4.4A2.6 2.6 0 0 0 7.2 8.5" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
  '<path d="M12 11.2v3.4M8.8 19h6.4l-0.7-3.6H9.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>';

const bolt = '<path d="M13.5 2L4 14.2h6L8.7 22 20 9.4h-6.2z" fill="currentColor"/>';

const ballSpark =
  '<g transform="translate(-1 1)">' +
  '<circle cx="11" cy="12" r="6.8" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<path d="M11 8.2l2.7 2-1 3.2h-3.4l-1-3.2z" fill="currentColor"/></g>' +
  '<path d="M18.5 3l0.9 2.3 2.3 0.9-2.3 0.9L18.5 9.4l-0.9-2.3L15.3 6.2l2.3-0.9z" fill="currentColor"/>';

const target =
  '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<text x="12" y="15.4" text-anchor="middle" font-size="7.5" font-weight="800" fill="currentColor" font-family="Manrope, sans-serif">5</text>';

const targetDart =
  '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<circle cx="12" cy="12" r="1.4" fill="currentColor"/>' +
  '<path d="M21 3l-7.2 7.2M15.5 3.5H21V9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';

const targetPerfect =
  '<circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<circle cx="12" cy="12" r="1.4" fill="currentColor"/>' +
  '<path d="M12 1v2.4M12 20.6V23M1 12h2.4M20.6 12H23M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M19.8 4.2l-1.7 1.7M5.9 18.1l-1.7 1.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';

const up = (letter: string) =>
  '<path d="M4 11.4l8-7 8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  `<text x="12" y="21.4" text-anchor="middle" font-size="8.5" font-weight="800" fill="currentColor" font-family="Manrope, sans-serif">${letter}</text>`;

// El banderín de córner de la marca (BrandMark.tsx), reescalado de su viewBox 64x64 al 24x24
// de los motifs — la insignia de bienvenida usa el símbolo de la app misma.
const flagWelcome =
  '<path d="M9.8 3.8L9.8 19.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
  '<ellipse cx="9.8" cy="20.4" rx="2" ry="0.7" fill="currentColor" opacity="0.5"/>' +
  '<path d="M9.8 4.5Q13.5 5.1 17.1 7.7Q13.5 10.1 9.8 10.3Z" fill="currentColor"/>';

const laurelOne =
  '<path d="M8.4 20C4.6 18.2 3.4 13 4.6 8c3 1 4.9 4.2 4.7 8.2M15.6 20c3.8-1.8 5-7 3.8-12-3 1-4.9 4.2-4.7 8.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
  '<text x="12" y="15.2" text-anchor="middle" font-size="9.5" font-weight="800" fill="currentColor" font-family="Manrope, sans-serif">1</text>';

const crown =
  '<path d="M3.6 9l3.7 2.6L12 5l4.7 6.6L20.4 9l-1.9 9.6H5.5z" fill="currentColor"/>' +
  '<circle cx="3.6" cy="8.8" r="1.7" fill="currentColor"/>' +
  '<circle cx="20.4" cy="8.8" r="1.7" fill="currentColor"/>' +
  '<circle cx="12" cy="4.4" r="1.7" fill="currentColor"/>' +
  '<rect x="5.2" y="19.8" width="13.6" height="2.4" rx="1.2" fill="currentColor"/>';

const questionMark =
  '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<text x="12" y="16.4" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor" font-family="Manrope, sans-serif">?</text>';

const questionMarkSpark =
  '<circle cx="10.4" cy="13.2" r="7.6" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<text x="10.4" y="16.9" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" font-family="Manrope, sans-serif">?</text>' +
  '<path d="M18.5 3l0.9 2.3 2.3 0.9-2.3 0.9L18.5 9.4l-0.9-2.3L15.3 6.2l2.3-0.9z" fill="currentColor"/>';

const openBook =
  '<path d="M3 5.6c2.4-1.1 5-1.4 7.4 0v13c-2.4-1.4-5-1.1-7.4 0z" fill="currentColor" opacity="0.8"/>' +
  '<path d="M21 5.6c-2.4-1.1-5-1.4-7.4 0v13c2.4-1.4 5-1.1 7.4 0z" fill="currentColor"/>' +
  '<path d="M12 5.4v13.2" stroke="#12101f" stroke-width="1" stroke-opacity="0.45"/>';

// ── catálogo ─────────────────────────────────────────────────────────────────
export const BADGES: BadgeDef[] = [
  // aciertos acumulados
  { id: "debut", group: "aciertos", name: "Debut", rarity: "bronce", motif: ball,
    flavor: "Tus primeros diez. Ya no es suerte de principiante.",
    criterio: "10 pronósticos acertados" },
  { id: "pulso", group: "aciertos", name: "Pulso", rarity: "plata", motif: ballFast,
    flavor: "Cincuenta aciertos. Le empezás a tomar el pulso a la fecha.",
    criterio: "50 pronósticos acertados" },
  { id: "ojo", group: "aciertos", name: "Ojo", rarity: "oro", motif: eye,
    flavor: "Cien. Tenés ojo para esto.",
    criterio: "100 pronósticos acertados" },
  { id: "fenomeno", group: "aciertos", name: "Fenómeno", rarity: "marca", motif: star,
    flavor: "Quinientos. Sabés más que varios técnicos de Primera.",
    criterio: "500 pronósticos acertados" },

  // rachas — fechas seguidas acertándole a más de la mitad de tus pronósticos
  { id: "enracha", group: "rachas", name: "En racha", rarity: "bronce", motif: flame,
    flavor: "Tres fechas seguidas acertando la mayoría. Estás fino.",
    criterio: "3 fechas seguidas con +50% de aciertos" },
  { id: "imparable", group: "rachas", name: "Imparable", rarity: "plata", motif: flameDouble,
    flavor: "Cinco fechas ganándole a la mayoría de tus pronósticos. No aflojás.",
    criterio: "5 fechas seguidas con +50% de aciertos" },
  { id: "elegido", group: "rachas", name: "Elegido", rarity: "oro", motif: flameStar,
    flavor: "Ocho fechas seguidas fino. Alguien allá arriba te quiere.",
    criterio: "8 fechas seguidas con +50% de aciertos" },

  // resultados exactos
  { id: "cinco", group: "exactos", name: "Cinco de cinco", rarity: "plata", motif: target,
    flavor: "Tu primer resultado exacto. Bonus completo.",
    criterio: "Clavar 1 resultado exacto (5 pts)" },
  { id: "adivino", group: "exactos", name: "Adivino", rarity: "oro", motif: targetDart,
    flavor: "Diez marcadores exactos. Esto ya no es casualidad.",
    criterio: "Clavar 10 resultados exactos" },
  { id: "brujo", group: "exactos", name: "Brujo", rarity: "marca", motif: targetPerfect,
    flavor: "Veinticinco al hueso. ¿Vos en qué laburás?",
    criterio: "Clavar 25 resultados exactos" },

  // trivia diaria — aciertos de por vida, sin relación con el tope que suma a la liga
  { id: "curioso", group: "trivia", name: "Preguntón", rarity: "bronce", motif: questionMark,
    flavor: "Diez aciertos en la trivia diaria. Le vas agarrando la mano.",
    criterio: "10 aciertos en la trivia diaria" },
  { id: "erudito", group: "trivia", name: "Sabelotodo", rarity: "plata", motif: questionMarkSpark,
    flavor: "Treinta aciertos. Ya sabés más folclore futbolero que la mayoría.",
    criterio: "30 aciertos en la trivia diaria" },
  { id: "enciclopedia", group: "trivia", name: "Enciclopedia", rarity: "oro", motif: openBook,
    flavor: "Sesenta aciertos. A este paso deberías dar clases.",
    criterio: "60 aciertos en la trivia diaria" },

  // ascensos
  { id: "sub-c", group: "ascensos", name: "Bienvenido a la C", rarity: "plata", motif: up("C"),
    flavor: "Dejaste la D. Primer ascenso de tu carrera.",
    criterio: "Llegar por primera vez a Primera C" },
  { id: "sub-b", group: "ascensos", name: "Subiste a la B", rarity: "plata", motif: up("B"),
    flavor: "Tercera categoría. Ya no sos uno más.",
    criterio: "Llegar por primera vez a Primera B" },
  { id: "sub-n", group: "ascensos", name: "Estás en el Nacional", rarity: "oro", motif: up("N"),
    flavor: "A un escalón de la Primera.",
    criterio: "Llegar por primera vez a Primera Nacional" },
  { id: "sub-1", group: "ascensos", name: "Llegaste a Primera", rarity: "marca", motif: cup,
    flavor: "El techo. Acá se juega entre los mejores de la app.",
    criterio: "Llegar por primera vez a Primera División" },

  // hitos — "bienvenida" no la evalúa award.ts: se otorga directo en lib/welcome.ts, la
  // primera vez que el usuario llega a /pronosticos (ver WelcomeOverlay).
  { id: "bienvenida", group: "hitos", name: "¡Bienvenido!", rarity: "bronce", motif: flagWelcome,
    flavor: "Tu primer día en Fechita. Esto recién arranca.",
    criterio: "Entrar a Fechita por primera vez" },
  { id: "ganador", group: "hitos", name: "Ganador de la fecha", rarity: "oro", motif: laurelOne,
    flavor: "Terminaste 1° de tu grupo. La fecha fue tuya.",
    criterio: "Salir 1° de tu grupo al cerrar una fecha" },
  { id: "superclasico", group: "hitos", name: "Superclásico", rarity: "marca", motif: bolt,
    flavor: "Cantaste el River–Boca. No cualquiera.",
    criterio: "Acertar la dirección de un River–Boca" },
  { id: "sorpresa", group: "hitos", name: "Cantaste la sorpresa", rarity: "oro", motif: ballSpark,
    flavor: "Acertaste el resultado que casi todos erraron.",
    criterio: "Acertar un partido donde 70%+ de la app erró" },

  // meta — se gana sola al completar todas las demás
  { id: "coleccionista", group: "meta", name: "Las tenés todas", rarity: "marca", motif: crown,
    flavor: "Completaste la vitrina. No te queda una sola por desbloquear.",
    criterio: "Ganar todas las demás insignias" },
];

// La insignia de colección completa: se otorga cuando el usuario ya tiene todas las otras.
export const META_BADGE_ID = "coleccionista";

export const BADGE_IDS = BADGES.map((b) => b.id);

export const NON_META_BADGE_IDS = BADGES.filter((b) => b.group !== "meta").map((b) => b.id);

const byId = new Map(BADGES.map((b) => [b.id, b]));

export function getBadge(id: string): BadgeDef | undefined {
  return byId.get(id);
}

export const BADGE_GROUPS: { group: BadgeGroup; label: string; badges: BadgeDef[] }[] = (
  ["aciertos", "rachas", "exactos", "trivia", "ascensos", "hitos", "meta"] as const
).map((group) => ({
  group,
  label: GROUP_LABELS[group],
  badges: BADGES.filter((b) => b.group === group),
}));
