import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import UserModel from "@/models/User";
import UserBadgeModel from "@/models/UserBadge";

export const WELCOME_BADGE_ID = "bienvenida";

// true = todavía no vio la pantalla de bienvenida (primera visita real a /pronosticos, sin
// importar si llegó por Credentials o por Google/onboarding — ver User.welcomedAt).
export function isPendingWelcome(user: { welcomedAt?: Date | null }): boolean {
  return !user.welcomedAt;
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
