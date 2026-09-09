import { Types } from "mongoose";
import { connectToDatabase } from "../db";
import { BADGES, getBadge, type BadgeDef } from "./catalog";
import UserBadgeModel from "@/models/UserBadge";

export type EarnedBadge = BadgeDef & { earnedAt: Date };

// Insignias ganadas y todavía no vistas — alimentan el festejo de /pronosticos, igual que
// getPendingLeagueResult alimenta el anuncio de ascenso en /liga.
export async function getUnseenBadges(userId: Types.ObjectId | string): Promise<EarnedBadge[]> {
  await connectToDatabase();
  const rows = await UserBadgeModel.find({ userId, seen: false }).sort({ earnedAt: 1 });
  return rows
    .map((r) => {
      const def = getBadge(r.badgeId);
      return def ? { ...def, earnedAt: r.earnedAt as Date } : null;
    })
    .filter((b): b is EarnedBadge => b !== null);
}

export async function markBadgesSeen(userId: Types.ObjectId | string): Promise<void> {
  await connectToDatabase();
  await UserBadgeModel.updateMany({ userId, seen: false }, { seen: true });
}

// Estado completo para la pantalla de perfil: las 15 en orden de catálogo, marcadas como
// ganadas o no.
export async function getBadgeShowcase(userId: Types.ObjectId | string) {
  await connectToDatabase();
  const earned = new Map(
    (await UserBadgeModel.find({ userId })).map((r) => [r.badgeId, r.earnedAt as Date])
  );
  return {
    earnedCount: [...earned.keys()].filter((id) => getBadge(id)).length,
    total: BADGES.length,
    badges: BADGES.map((b) => ({ ...b, earned: earned.has(b.id), earnedAt: earned.get(b.id) ?? null })),
  };
}

// Solo panel dev (modo mock).
export async function resetUserBadges(userId: Types.ObjectId | string): Promise<void> {
  await connectToDatabase();
  await UserBadgeModel.deleteMany({ userId });
}
