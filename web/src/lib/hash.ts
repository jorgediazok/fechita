// Hash determinístico de un string a un entero de 53 bits (cyrb53, de bryc/dek). Mismo input
// → mismo output siempre, en cualquier proceso/entorno — no es para seguridad, es para
// convertir un seed legible (ej. "botId:matchId", una fecha "YYYY-MM-DD") en un número
// reproducible del que sacar un índice o una racha de RNG. Compartido por bots/strategy.ts
// (una jugada por partido) y trivia/today.ts (la pregunta del día).
export function cyrb53(str: string, seed = 0): number {
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
