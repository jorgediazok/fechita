import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
import TeamModel from "@/models/Team";
import { enrollUserForCurrentRound } from "@/lib/leagues";
import { TIER_ORDER } from "@/lib/tiers";
import { BOT_NAMES, botEmail } from "./names";

// skill repartido en escalera de 0.45 a 0.87 — hay bots flojos y bots que la pegan seguido,
// para que la tabla tenga spread real y no todos terminen empatados.
function skillFor(index: number) {
  return Math.round((0.45 + (index / (BOT_NAMES.length - 1)) * 0.42) * 100) / 100;
}

// Los bots nuevos se reparten parejo por categoría (4 por tier con 20 bots) para que ni
// bien arranca haya con quién competir en todas las divisiones, no solo en la D. Después
// cada uno sube o baja por su cuenta según cómo le vaya.
function tierFor(index: number) {
  return TIER_ORDER[index % TIER_ORDER.length];
}

export type SeedBotsResult = { total: number; created: number };

// Idempotente por email. Al bot que ya existe solo le refresca nombre/flag; NO le toca el
// equipo, el skill ni la categoría (un bot conserva el tier que se ganó). Después reinscribe
// a todos en la liga de la semana actual.
export async function seedBots(): Promise<SeedBotsResult> {
  await connectToDatabase();

  const teams = await TeamModel.find({}, { _id: 1 });
  if (teams.length === 0) {
    throw new Error("No hay equipos en la base — sincronizá partidos primero (/pronosticos, panel dev).");
  }

  const emails = BOT_NAMES.map(botEmail);
  const existing = new Set(
    (await UserModel.find({ email: { $in: emails } }, { email: 1 })).map((u) => u.email)
  );

  let created = 0;
  for (let i = 0; i < BOT_NAMES.length; i++) {
    const name = BOT_NAMES[i];
    const email = emails[i];

    if (existing.has(email)) {
      await UserModel.updateOne({ email }, { $set: { name, isBot: true } });
    } else {
      await UserModel.create({
        name,
        email,
        isBot: true,
        botSkill: skillFor(i),
        favoriteTeamId: teams[Math.floor(Math.random() * teams.length)]._id,
        currentTier: tierFor(i),
      });
      created++;
    }
  }

  const bots = await UserModel.find({ email: { $in: emails } }, { _id: 1 });
  for (const bot of bots) await enrollUserForCurrentRound(bot._id);

  return { total: BOT_NAMES.length, created };
}
