// Matemática pura de las zonas de ascenso/descenso — separada de lib/leagues.ts (que toca
// modelos/DB) para poder testearla sin montar nada, igual que lib/tiers.ts.

// Tamaño de la zona de ascenso/descenso: ~25% del grupo, clampeado para que un grupo chico
// (dev, pocos usuarios) nunca promueva y descienda a la misma persona. Con un grupo de ~24
// da ~6. La página de liga usa el mismo criterio para que lo que el usuario ve coincida con
// lo que va a pasar al cerrar la fecha.
export function zoneSize(memberCount: number) {
  if (memberCount <= 1) return 0;
  const target = Math.round(memberCount * 0.25);
  return Math.min(Math.max(target, 1), Math.floor(memberCount / 2));
}
