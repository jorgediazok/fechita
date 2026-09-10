import { getBadge } from "@/lib/badges/catalog";
import { TIER_FULL_NAMES, type TierCode } from "@/lib/tiers";
import { SITE_NAME } from "@/lib/site";

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export function testMessage(): PushPayload {
  return {
    title: SITE_NAME,
    body: "Listo, las notificaciones están activadas. Te vamos a avisar cuando cierre la fecha y cuando sumes puntos.",
    url: "/pronosticos",
    tag: "test",
  };
}

export function resultReadyMessage(roundKey: string, points: number): PushPayload {
  return {
    title: `Se terminó la ${roundKey}`,
    body:
      points > 0
        ? `Sumaste ${points} ${plural(points, "punto", "puntos")}. Mirá cómo quedaste en tu liga.`
        : "Esta vez no sumaste. Revancha en la próxima fecha.",
    url: "/liga",
    tag: "result",
  };
}

export function badgeMessage(badgeId: string): PushPayload {
  const badge = getBadge(badgeId);
  return {
    title: badge ? `Nueva insignia: ${badge.name}` : "Nueva insignia",
    body: badge?.flavor || "Ganaste una insignia nueva. Mirala en tu perfil.",
    url: "/perfil/insignias",
    tag: `badge-${badgeId}`,
  };
}

export function roundCloseMessage(opts: {
  result: "promoted" | "relegated" | "stayed";
  wonRound: boolean;
  roundKey: string;
  newTier: TierCode;
}): PushPayload | null {
  const { result, wonRound, roundKey, newTier } = opts;
  const tierName = TIER_FULL_NAMES[newTier];

  if (wonRound && result === "promoted") {
    return {
      title: `👑 Ganaste la ${roundKey} y ascendiste`,
      body: `Saliste primero en tu grupo. Estás en ${tierName}.`,
      url: "/liga",
      tag: "round-close",
    };
  }
  if (wonRound) {
    return {
      title: `👑 Ganaste la ${roundKey}`,
      body: "Saliste primero en tu grupo. Bancá el trono la próxima.",
      url: "/liga",
      tag: "round-close",
    };
  }
  if (result === "promoted") {
    return {
      title: `Ascendiste a ${tierName} 🎉`,
      body: `Terminaste arriba en la ${roundKey}.`,
      url: "/liga",
      tag: "round-close",
    };
  }
  if (result === "relegated") {
    return {
      title: `Bajaste a ${tierName}`,
      body: `Se cerró la ${roundKey}. A recuperarla en la próxima.`,
      url: "/liga",
      tag: "round-close",
    };
  }
  return null;
}
