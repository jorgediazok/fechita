/**
 * Crea/actualiza los 20 usuarios bot y les carga los pronósticos de la ventana actual.
 *
 *   npm run seed:bots
 *
 * Idempotente: no duplica bots ni les reasigna equipo/skill/tier si ya existen. Se puede
 * correr en cualquier momento (incluso en prod la primera vez) sin tocar usuarios reales.
 */
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { seedBots, runBots } from "@/lib/bots";

async function main() {
  await connectToDatabase();

  const seeded = await seedBots();
  console.log(`bots: ${seeded.total} en total, ${seeded.created} nuevos`);

  const ran = await runBots();
  console.log(`pronósticos de bots creados: ${ran.predictionsCreated}`);

  await mongoose.disconnect();
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
