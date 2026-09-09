/**
 * Seed / limpieza de datos de prueba para las ligas por fecha (capa 3).
 *
 *   npm run seed            → limpia lo anterior y crea usuarios de prueba repartidos por tier
 *   npm run seed:clean      → solo limpia, no crea nada
 *
 * "Limpiar" borra:
 *   - todos los usuarios de prueba (email @seed.local) y sus predicciones / membresías
 *   - membresías de liga y de grupo huérfanas (usuario o grupo ya inexistente)
 *   - RoundLeagueGroup cerrados y sin miembros (chatarra de sesiones de test viejas)
 *
 * Los usuarios reales (Google / email+password) y sus datos NO se tocan, salvo que se los
 * reinscriba en la liga de la fecha actual para que queden agrupados con la camada nueva.
 *
 * Los puntos de las predicciones sembradas se asignan a mano (0/3/5) para que las tablas
 * tengan spread ya mismo y se pueda ver la zona de ascenso/descenso sin esperar resultados.
 */
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import UserModel from "@/models/User";
import TeamModel from "@/models/Team";
import MatchModel from "@/models/Match";
import PredictionModel from "@/models/Prediction";
import GroupMembershipModel from "@/models/GroupMembership";
import LeagueMembershipModel from "@/models/LeagueMembership";
import RoundLeagueGroupModel from "@/models/RoundLeagueGroup";
import { PREDICTION_DIRECTIONS } from "@/models/Prediction";
import { TIER_ORDER } from "@/lib/tiers";
import { enrollUserForCurrentRound, getCurrentRoundKey } from "@/lib/leagues";
import { seedBots, runBots } from "@/lib/bots";

const SEED_DOMAIN = "seed.local";
const SEED_PASSWORD = "seed1234";
const USERS_PER_TIER = 6;

const FIRST_NAMES = [
  "Santi", "Nico", "Facu", "Male", "Tomi", "Ceci", "Bruno", "Vale", "Juli", "Rodri",
  "Mica", "Fede", "Cami", "Lucho", "Aye", "Iván", "Sol", "Gonza", "Pili", "Mati",
  "Dai", "Agus", "Naza", "Rocío", "Emi", "Belu", "Joaco", "Flor", "Pedro", "Trini",
];
const LAST_NAMES = [
  "Gómez", "Fernández", "Rodríguez", "Álvarez", "Romero", "Sosa", "Medina", "Ruiz",
  "Benítez", "Acuña", "Ledesma", "Ojeda", "Cabrera", "Molina", "Ferreyra", "Quiroga",
  "Ibáñez", "Vera", "Luna", "Peralta", "Silva", "Correa", "Herrera", "Villalba",
  "Godoy", "Maldonado", "Aguirre", "Cardozo", "Bianchi", "Domínguez",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function clean() {
  const seedUsers = await UserModel.find({ email: new RegExp(`@${SEED_DOMAIN}$`) }, { _id: 1 });
  const seedIds = seedUsers.map((u) => u._id);

  if (seedIds.length) {
    await PredictionModel.deleteMany({ userId: { $in: seedIds } });
    await LeagueMembershipModel.deleteMany({ userId: { $in: seedIds } });
    await GroupMembershipModel.deleteMany({ userId: { $in: seedIds } });
    await UserModel.deleteMany({ _id: { $in: seedIds } });
  }
  console.log(`  usuarios de prueba borrados: ${seedIds.length}`);

  const liveUserIds = (await UserModel.find({}, { _id: 1 })).map((u) => u._id);

  const orphanLeague = await LeagueMembershipModel.deleteMany({ userId: { $nin: liveUserIds } });
  const orphanGroup = await GroupMembershipModel.deleteMany({ userId: { $nin: liveUserIds } });
  console.log(`  membresías huérfanas por usuario: liga ${orphanLeague.deletedCount}, grupo ${orphanGroup.deletedCount}`);

  // Membresías de liga cuyo grupo ya no existe.
  const groupIds = new Set((await RoundLeagueGroupModel.find({}, { _id: 1 })).map((g) => String(g._id)));
  const danglingLeague = await LeagueMembershipModel.find({}, { _id: 1, groupId: 1 });
  const toDrop = danglingLeague.filter((m) => !groupIds.has(String(m.groupId))).map((m) => m._id);
  if (toDrop.length) await LeagueMembershipModel.deleteMany({ _id: { $in: toDrop } });
  console.log(`  membresías de liga sin grupo: ${toDrop.length}`);

  // Grupos de fecha cerrados o sin ningún miembro → chatarra. Los grupos de la fecha actual
  // con miembros se dejan (los reinscribe seed() más abajo).
  const currentRoundKey = await getCurrentRoundKey();
  const allGroups = await RoundLeagueGroupModel.find({}, { _id: 1, status: 1, roundKey: 1 });
  let removedGroups = 0;
  for (const g of allGroups) {
    const count = await LeagueMembershipModel.countDocuments({ groupId: g._id });
    if (g.status === "closed" || count === 0 || g.roundKey !== currentRoundKey) {
      await LeagueMembershipModel.deleteMany({ groupId: g._id });
      await RoundLeagueGroupModel.deleteOne({ _id: g._id });
      removedGroups++;
    }
  }
  console.log(`  grupos de fecha cerrados / viejos / vacíos borrados: ${removedGroups}`);
}

async function seed() {
  const teams = await TeamModel.find({}, { _id: 1 });
  if (!teams.length) {
    throw new Error("No hay equipos en la base — corré una sync de partidos primero (/pronosticos, panel dev).");
  }

  const roundKey = await getCurrentRoundKey();
  if (!roundKey) throw new Error("No hay fechas cargadas — corré una sync de partidos primero.");
  const roundMatches = await MatchModel.find({ round: roundKey }, { _id: 1 });
  console.log(`  ${roundKey}: ${roundMatches.length} partidos para pronosticar`);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const usedNames = new Set<string>();
  const directions = [...PREDICTION_DIRECTIONS];

  const userDocs: Record<string, unknown>[] = [];
  let n = 0;
  for (const tier of TIER_ORDER) {
    for (let i = 0; i < USERS_PER_TIER; i++) {
      let name = "";
      do {
        name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      } while (usedNames.has(name));
      usedNames.add(name);
      const slug = name.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
      userDocs.push({
        name,
        email: `${slug}${n}@${SEED_DOMAIN}`,
        passwordHash,
        favoriteTeamId: pick(teams)._id,
        currentTier: tier,
      });
      n++;
    }
  }

  const users = await UserModel.insertMany(userDocs);
  await PredictionModel.insertMany(
    users.flatMap((u) =>
      roundMatches.map((m) => ({
        userId: u._id,
        matchId: m._id,
        predictedDirection: pick(directions),
        points: pick([0, 0, 3, 3, 3, 5]),
      }))
    )
  );
  for (const u of users) await enrollUserForCurrentRound(u._id);
  console.log(`  usuarios de prueba creados: ${users.length} (${USERS_PER_TIER} por tier) — contraseña: ${SEED_PASSWORD}`);

  const bots = await seedBots();
  const botPreds = await runBots();
  console.log(`  bots: ${bots.total} (${bots.created} nuevos), ${botPreds.predictionsCreated} pronósticos cargados`);

  // Reinscribir a los usuarios reales (no de prueba, incluye bots) para que caigan en el
  // grupo de la camada nueva.
  const realUsers = await UserModel.find(
    { email: { $not: new RegExp(`@${SEED_DOMAIN}$`) } },
    { _id: 1 }
  );
  for (const u of realUsers) await enrollUserForCurrentRound(u._id);
  console.log(`  usuarios reales/bot reinscriptos en la liga de la fecha: ${realUsers.length}`);
}

async function main() {
  const cleanOnly = process.argv.includes("--clean-only");
  await connectToDatabase();

  console.log("Limpiando…");
  await clean();

  if (!cleanOnly) {
    console.log("Sembrando…");
    await seed();
  }

  await mongoose.disconnect();
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
