import { describe, it, expect } from "vitest";
import UserModel from "@/models/User";
import UserBadgeModel from "@/models/UserBadge";
import { isPendingWelcome, completeWelcome, WELCOME_BADGE_ID } from "./welcome";
import { makeUser } from "../../test/factories";

describe("isPendingWelcome", () => {
  it("true sin welcomedAt, false con welcomedAt seteado", () => {
    expect(isPendingWelcome({ welcomedAt: null })).toBe(true);
    expect(isPendingWelcome({})).toBe(true);
    expect(isPendingWelcome({ welcomedAt: new Date() })).toBe(false);
  });
});

describe("completeWelcome", () => {
  it("marca welcomedAt y da la insignia de bienvenida ya vista", async () => {
    const user = await makeUser();
    expect(user.welcomedAt).toBeFalsy();

    await completeWelcome(user._id);

    const updated = await UserModel.findById(user._id);
    expect(updated?.welcomedAt).toBeInstanceOf(Date);

    const badge = await UserBadgeModel.findOne({ userId: user._id, badgeId: WELCOME_BADGE_ID });
    expect(badge).not.toBeNull();
    expect(badge?.seen).toBe(true);
  });

  it("es idempotente: correrlo dos veces no duplica la insignia ni rompe", async () => {
    const user = await makeUser();
    await completeWelcome(user._id);
    await completeWelcome(user._id);

    const count = await UserBadgeModel.countDocuments({ userId: user._id, badgeId: WELCOME_BADGE_ID });
    expect(count).toBe(1);
  });
});
