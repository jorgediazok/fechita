import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import { triviaDayKey } from "./trivia/today";
import UserModel from "@/models/User";
import UserBadgeModel from "@/models/UserBadge";

export const WELCOME_BADGE_ID = "bienvenida";

// true = todavía no vio la pantalla de bienvenida (primera visita real a /pronosticos, sin
// importar si llegó por Credentials o por Google/onboarding — ver User.welcomedAt).
export function isPendingWelcome(user: { welcomedAt?: Date | null }): boolean {
  return !user.welcomedAt;
}

// La trivia recién se muestra al día siguiente de completar la bienvenida — el mismo día
// que arrancó a usar la app (todavía aprendiendo el loop central) no tiene sentido pedirle
// cultura general. Se compara por "día de trivia" (medianoche argentina, mismo criterio que
// la pregunta del día en trivia/today.ts), no por sesión: la sesión dura 30 días por
// default (auth.ts no fija `maxAge`), así que atarlo a un login de verdad dejaría a la
// mayoría sin ver trivia durante semanas.
export function isTriviaEligible(user: { welcomedAt?: Date | null }, now: Date = new Date()): boolean {
  if (!user.welcomedAt) return false;
  return triviaDayKey(user.welcomedAt) !== triviaDayKey(now);
}

// Cierra el onboarding "de verdad": marca la bienvenida vista y le da la insignia de
// bienvenida ya marcada como vista (`seen: true`) — el propio WelcomeOverlay ES el festejo,
// no hace falta que además la agarre el festejo genérico de insignias
// (BadgeUnlockOverlay/getUnseenBadges) la próxima vez que entre. Idempotente.
export async function completeWelcome(userId: Types.ObjectId | string): Promise<void> {
  await connectToDatabase();
  await UserModel.updateOne({ _id: userId, welcomedAt: null }, { $set: { welcomedAt: new Date() } });
  await UserBadgeModel.updateOne(
    { userId, badgeId: WELCOME_BADGE_ID },
    { $setOnInsert: { userId, badgeId: WELCOME_BADGE_ID, earnedAt: new Date(), seen: true } },
    { upsert: true }
  );
}
