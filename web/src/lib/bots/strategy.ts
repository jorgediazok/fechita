import { HOME_ADVANTAGE } from "./teamStrength";

// RNG determinístico: mismo (bot, partido) → misma jugada siempre. Así no hace falta
// bloquear nada para que un re-run no cambie pronósticos ya hechos, y los tests son estables.
function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Direction = "home" | "draw" | "away";

// Probabilidad de cada resultado a partir de la diferencia de fuerza + ventaja de localía.
export function outcomeProbabilities(homeStrength: number, awayStrength: number) {
  const diff = (homeStrength + HOME_ADVANTAGE - awayStrength) / 18;
  const sig = 1 / (1 + Math.exp(-diff)); // P(local es mejor), 0..1
  const draw = 0.3 * Math.exp(-Math.abs(diff) / 1.8);
  const home = (1 - draw) * sig;
  const away = 1 - draw - home;
  return { home, draw, away };
}

function sample(rng: () => number, p: Record<Direction, number>): Direction {
  const total = p.home + p.draw + p.away;
  let r = rng() * total;
  if ((r -= p.home) < 0) return "home";
  if ((r -= p.draw) < 0) return "draw";
  return "away";
}

const SCORE_TABLE: Record<Direction, [number, number][]> = {
  home: [[1, 0], [2, 0], [2, 1], [3, 1]],
  draw: [[1, 1], [0, 0], [2, 2]],
  away: [[0, 1], [1, 2], [0, 2], [1, 3]],
};

export type BotPrediction = {
  direction: Direction;
  homeScore: number | null;
  awayScore: number | null;
};

// skill 0..1: 1 = sigue el modelo a rajatabla, 0 = tira una moneda entre los tres resultados.
export function predictMatch(opts: {
  homeStrength: number;
  awayStrength: number;
  skill: number;
  seed: string;
}): BotPrediction {
  const rng = mulberry32(cyrb53(opts.seed));
  const model = outcomeProbabilities(opts.homeStrength, opts.awayStrength);
  const skill = Math.min(Math.max(opts.skill, 0), 1);

  // Un exponente sobre las probabilidades del modelo: skill alto agudiza hacia el favorito,
  // skill bajo aplana hacia moneda al aire. Más decisivo que mezclar con una uniforme.
  const sharp = 0.4 + 2.2 * skill; // 0.4 (plano) .. 2.6 (picudo)
  const p: Record<Direction, number> = {
    home: Math.pow(model.home, sharp),
    draw: Math.pow(model.draw, sharp),
    away: Math.pow(model.away, sharp),
  };

  const direction = sample(rng, p);

  // Solo a veces se juega el marcador exacto (bonus +5), más seguido cuanto mejor el bot.
  if (rng() < 0.22 * skill) {
    const options = SCORE_TABLE[direction];
    const [homeScore, awayScore] = options[Math.floor(rng() * options.length)];
    return { direction, homeScore, awayScore };
  }

  return { direction, homeScore: null, awayScore: null };
}
