import { getBadge, RARITY, type BadgeRarity } from "@/lib/badges/catalog";

const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

const LOCK =
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
  '<rect x="5" y="10.5" width="14" height="10" rx="2.4" fill="currentColor"/>' +
  '<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

// Medallón hexagonal de una insignia — marco por rareza, glow, motivo SVG interno. Server
// component (los SVG del catálogo son estáticos). El festejo animado vive aparte, en
// BadgeUnlockOverlay.
export function Badge({
  badgeId,
  rarity,
  motif,
  size = 112,
  locked = false,
}: {
  badgeId?: string;
  rarity?: BadgeRarity;
  motif?: string;
  size?: number;
  locked?: boolean;
}) {
  const def = badgeId ? getBadge(badgeId) : undefined;
  const r = RARITY[rarity ?? def?.rarity ?? "marca"];
  const inner = motif ?? def?.motif ?? "";
  const svg =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ' +
    'style="width:100%;height:100%;display:block;overflow:visible">' +
    inner +
    "</svg>";

  return (
    <div style={{ width: size, height: size, position: "relative", display: "grid", placeItems: "center" }}>
      {!locked && (
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${r.glow}, transparent 68%)`,
            filter: "blur(3px)",
          }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, clipPath: HEX, background: locked ? "#23253f" : r.ring }} />
      <div
        style={{
          position: "absolute",
          inset: Math.max(3, size * 0.045),
          clipPath: HEX,
          background: locked ? "#0e0f1e" : r.face,
          color: locked ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.92)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{ position: "relative", width: "50%", height: "50%" }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      {locked && (
        <div style={{ position: "absolute", width: "34%", height: "34%", color: "#3b3e63" }}
          dangerouslySetInnerHTML={{ __html: LOCK }} />
      )}
    </div>
  );
}
