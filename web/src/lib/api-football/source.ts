// De dónde salen los partidos. Se elige con FIXTURE_SOURCE en .env.local:
//   - "mock"         → fixtures simulados, sin red (default; habilita el panel dev de /pronosticos y /liga)
//   - "theoddsapi"   → The Odds API, free tier, temporada argentina actual real (en uso)
//   - "replay"       → temporada real 2024 (bajada con `npm run fetch-season`) corrida al presente
//   - "thesportsdb"  → TheSportsDB; el free tier limita las listas a 1 resultado, necesita key paga
//   - "api-football" → API-Football (de pago para la temporada en curso)
// API_FOOTBALL_MODE=live se sigue aceptando como alias de "api-football" por compatibilidad.
export type FixtureSource = "mock" | "theoddsapi" | "replay" | "thesportsdb" | "api-football";

export function getFixtureSource(): FixtureSource {
  const raw = process.env.FIXTURE_SOURCE ?? process.env.API_FOOTBALL_MODE;
  if (raw === "theoddsapi") return "theoddsapi";
  if (raw === "replay") return "replay";
  if (raw === "thesportsdb") return "thesportsdb";
  if (raw === "api-football" || raw === "live") return "api-football";
  return "mock";
}

// El panel dev (simular resultados, cerrar la semana a mano, corrimiento de semana simulado)
// solo tiene sentido con datos totalmente simulados.
export function isMockMode(): boolean {
  return getFixtureSource() === "mock";
}

// El modo replay muestra fútbol de 2024, no en vivo: la UI lo aclara con un cartel.
export function isReplayMode(): boolean {
  return getFixtureSource() === "replay";
}
