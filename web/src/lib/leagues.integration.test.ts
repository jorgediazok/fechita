import { describe, it, expect } from "vitest";
import LeagueMembershipModel from "@/models/LeagueMembership";
import UserModel from "@/models/User";
import RoundLeagueGroupModel from "@/models/RoundLeagueGroup";
import {
  enrollUserForCurrentRound,
  closeExpiredGroups,
  getCurrentRoundKey,
  getGroupStanding,
  zoneSize,
} from "@/lib/leagues";
import { makeUsers, makeRoundMatches, finishRound, scoreUserInRound } from "../../test/factories";

// Fecha 1 en curso con `count` usuarios en `tier` inscriptos; después se terminan sus
// partidos y se les dan puntos distintos (el usuario i tiene (count - i) * 10 pts → orden
// determinístico, el índice 0 es el líder). Fecha 2 queda pendiente para la reinscripción.
async function seedFinishedRound(tier: "D" | "C" | "B" | "NACIONAL" | "PRIMERA", count: number) {
  const users = await makeUsers(count, tier);
  const matches = await makeRoundMatches("Fecha 1", 3, {
    status: "scheduled",
    kickoffAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  });
  await makeRoundMatches("Fecha 2", 3, {
    status: "scheduled",
    kickoffAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });

  for (const u of users) await enrollUserForCurrentRound(u._id);

  await finishRound("Fecha 1");
  for (let i = 0; i < users.length; i++) {
    await scoreUserInRound(users[i]._id, matches, (count - i) * 10);
  }
  return { users };
}

async function tiersById(ids: (string | { toString(): string })[]) {
  const docs = await UserModel.find({ _id: { $in: ids } }, { currentTier: 1 });
  return new Map(docs.map((d) => [String(d._id), d.currentTier]));
}

describe("closeExpiredGroups — ascenso / descenso", () => {
  it("cierra la fecha cuando terminaron todos sus partidos", async () => {
    await seedFinishedRound("C", 8);
    const before = await RoundLeagueGroupModel.findOne({ roundKey: "Fecha 1" });
    expect(before?.status).toBe("active");

    await closeExpiredGroups();

    const after = await RoundLeagueGroupModel.findOne({ roundKey: "Fecha 1" });
    expect(after?.status).toBe("closed");
  });

  it("sube el top ~25% y baja el bottom ~25%; el resto se mantiene", async () => {
    const { users } = await seedFinishedRound("C", 12); // zoneSize(12) = 3
    const zone = zoneSize(12);
    expect(zone).toBe(3);

    await closeExpiredGroups();

    const tiers = await tiersById(users.map((u) => u._id));
    // users[0..2] son los de más puntos → promovidos a B
    for (let i = 0; i < zone; i++) expect(tiers.get(String(users[i]._id))).toBe("B");
    // users[9..11] son los de menos puntos → descendidos a D
    for (let i = 12 - zone; i < 12; i++) expect(tiers.get(String(users[i]._id))).toBe("D");
    // el medio se queda en C
    for (let i = zone; i < 12 - zone; i++) expect(tiers.get(String(users[i]._id))).toBe("C");
  });

  it("marca wonRound solo para el #1", async () => {
    const { users } = await seedFinishedRound("C", 6);
    await closeExpiredGroups();

    const won = await LeagueMembershipModel.find({ wonRound: true });
    expect(won).toHaveLength(1);
    expect(String(won[0].userId)).toBe(String(users[0]._id));
  });

  it("desde PRIMERA nadie asciende (no hay categoría más alta)", async () => {
    const { users } = await seedFinishedRound("PRIMERA", 8);
    await closeExpiredGroups();

    const tiers = await tiersById(users.map((u) => u._id));
    const zone = zoneSize(8);
    // top: se queda en PRIMERA
    for (let i = 0; i < zone; i++) expect(tiers.get(String(users[i]._id))).toBe("PRIMERA");
    // bottom: baja a NACIONAL
    for (let i = 8 - zone; i < 8; i++) expect(tiers.get(String(users[i]._id))).toBe("NACIONAL");

    const closed = await RoundLeagueGroupModel.findOne({ roundKey: "Fecha 1", status: "closed" });
    const memberships = await LeagueMembershipModel.find({ groupId: closed!._id });
    const results = new Map(memberships.map((m) => [String(m.userId), m.result]));
    for (let i = 0; i < zone; i++) expect(results.get(String(users[i]._id))).toBe("stayed");
  });

  it("desde la D nadie desciende", async () => {
    const { users } = await seedFinishedRound("D", 8);
    await closeExpiredGroups();

    const tiers = await tiersById(users.map((u) => u._id));
    const zone = zoneSize(8);
    for (let i = 0; i < zone; i++) expect(tiers.get(String(users[i]._id))).toBe("C"); // top sube
    for (let i = 8 - zone; i < 8; i++) expect(tiers.get(String(users[i]._id))).toBe("D"); // bottom se queda
  });

  it("reinscribe a todos en la fecha siguiente con el tier ya actualizado", async () => {
    const { users } = await seedFinishedRound("C", 8);
    await closeExpiredGroups();

    expect(await getCurrentRoundKey()).toBe("Fecha 2");

    // Cada usuario tiene una membresía activa en un grupo de Fecha 2 de su tier nuevo.
    for (const u of users) {
      const fresh = await UserModel.findById(u._id);
      const groups = await RoundLeagueGroupModel.find({
        roundKey: "Fecha 2",
        tier: fresh!.currentTier,
        status: "active",
      });
      const mem = await LeagueMembershipModel.findOne({
        groupId: { $in: groups.map((g) => g._id) },
        userId: u._id,
      });
      expect(mem, `usuario ${u.name} reinscripto`).not.toBeNull();
      expect(mem!.points).toBe(0);
      expect(mem!.result).toBeNull();
    }
  });

  it("getGroupStanding ordena por puntos de la fecha, de mayor a menor", async () => {
    const { users } = await seedFinishedRound("C", 5);
    const group = await RoundLeagueGroupModel.findOne({ roundKey: "Fecha 1" });
    const standing = await getGroupStanding(group!._id);

    expect(standing.map((s) => String(s.membership.userId))).toEqual(users.map((u) => String(u._id)));
    expect(standing.map((s) => s.points)).toEqual([50, 40, 30, 20, 10]);
  });
});
