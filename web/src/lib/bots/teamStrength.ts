// Fuerza aproximada por club (1-100), tosca y a ojo, solo para que los bots pronostiquen
// con algún criterio (favorito/local) en vez de tirar 1-X-2 al azar. Clave = externalId de
// API-Football (los mismos ids reales que usa el mock, ver src/lib/api-football/mockProvider).
// No pretende ser exacta ni actualizarse por fecha; si un club no está, se usa DEFAULT.
export const TEAM_STRENGTH: Record<number, number> = {
  435: 85, // River Plate
  451: 84, // Boca Juniors
  436: 80, // Racing Club
  438: 78, // Vélez Sarsfield
  450: 77, // Estudiantes L.P.
  456: 75, // Talleres Córdoba
  460: 72, // San Lorenzo
  445: 71, // Huracán
  458: 70, // Argentinos Jrs
  446: 69, // Lanús
  453: 69, // Independiente
  437: 68, // Rosario Central
  442: 67, // Defensa y Justicia
  440: 66, // Belgrano Córdoba
  439: 65, // Godoy Cruz
  452: 64, // Tigre
  478: 63, // Instituto Córdoba
  457: 63, // Newell's Old Boys
  1065: 62, // Central Córdoba (SdE)
  473: 61, // Independiente Rivadavia
  1064: 61, // Platense
  2432: 60, // Barracas Central
  455: 59, // Atlético Tucumán
  441: 59, // Unión Santa Fe
  434: 58, // Gimnasia L.P.
  449: 57, // Banfield
  474: 52, // Sarmiento (Junín)
  476: 50, // Deportivo Riestra
};

export const DEFAULT_TEAM_STRENGTH = 62;

// Puntos de fuerza que se le suman al local — la ventaja de jugar de local en Argentina.
export const HOME_ADVANTAGE = 8;

export function teamStrength(externalId: number | null | undefined): number {
  if (externalId == null) return DEFAULT_TEAM_STRENGTH;
  return TEAM_STRENGTH[externalId] ?? DEFAULT_TEAM_STRENGTH;
}
