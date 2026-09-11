/**
 * Seed del usuario fijo que usan los tests E2E de Playwright (`npm run test:e2e`).
 *
 * Idempotente: upsert por email, nunca crea duplicados, y de paso limpia insignias /
 * pronósticos / notificaciones de corridas anteriores — así el usuario arranca cada vez desde
 * cero (sin un BadgeUnlockOverlay de una insignia vieja tapando la pantalla en medio del
 * test). Corre `syncAllCompetitions()` primero para garantizar que haya Teams/Matches
 * sincronizados en modo mock (los tests necesitan al menos un partido pendiente).
 *
 * No toca usuarios reales ni los de `npm run seed` (dominio @seed.local) — domino separado
 * (@e2e.local) para no pisarse.
 */
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { isMockMode } from "@/lib/fixtures/source";
import { syncAllCompetitions } from "@/lib/sync";
import UserModel from "@/models/User";
import TeamModel from "@/models/Team";
import UserBadgeModel from "@/models/UserBadge";
import PredictionModel from "@/models/Prediction";
import NotificationLogModel from "@/models/NotificationLog";

export const E2E_EMAIL = "jugador@e2e.local";
export const E2E_PASSWORD = "e2e1234";

async function main() {
  if (!isMockMode()) {
    throw new Error(
      "seed-e2e necesita FIXTURE_SOURCE=mock — corre contra .env.local, no contra prod ni theoddsapi."
    );
  }

  await connectToDatabase();
  await syncAllCompetitions();

  const anyTeam = await TeamModel.findOne();
  if (!anyTeam) {
    throw new Error("No hay Teams sincronizados — revisá data/liga-profesional-fechas-1-3.json");
  }

  const passwordHash = await bcrypt.hash(E2E_PASSWORD, 10);

  const user = await UserModel.findOneAndUpdate(
    { email: E2E_EMAIL },
    {
      $set: {
        name: "E2E",
        passwordHash,
        favoriteTeamId: anyTeam._id,
        emailVerified: new Date(),
        welcomedAt: new Date(),
      },
      $setOnInsert: { email: E2E_EMAIL, currentTier: "D", bestTier: "D" },
    },
    { upsert: true, new: true }
  );

  await Promise.all([
    UserBadgeModel.deleteMany({ userId: user._id }),
    PredictionModel.deleteMany({ userId: user._id }),
    NotificationLogModel.deleteMany({ userId: user._id }),
  ]);

  console.log(`Usuario E2E listo: ${E2E_EMAIL} / ${E2E_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
