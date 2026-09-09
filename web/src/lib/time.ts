export function isPast(date: Date | string) {
  return Date.now() >= new Date(date).getTime();
}

// La carga de pronósticos de un partido cierra 1 hora ANTES del kickoff, no al kickoff.
// Es puro cálculo de tiempo contra Match.kickoffAt (ya en nuestra DB) — nunca llama a la API.
export const PREDICTION_LOCK_LEAD_MS = 60 * 60 * 1000;

export function predictionLockAt(kickoff: Date | string | number) {
  return new Date(new Date(kickoff).getTime() - PREDICTION_LOCK_LEAD_MS);
}

export function isPredictionLocked(kickoff: Date | string | number) {
  return Date.now() >= new Date(kickoff).getTime() - PREDICTION_LOCK_LEAD_MS;
}

export function isWithinDays(date: Date | string | number, days: number) {
  return new Date(date).getTime() - Date.now() <= days * 24 * 60 * 60 * 1000;
}

// La fecha no quedó más de `days` días en el pasado (para dejar de mostrar rondas ya jugadas).
export function isWithinPastDays(date: Date | string | number, days: number) {
  return Date.now() - new Date(date).getTime() <= days * 24 * 60 * 60 * 1000;
}
