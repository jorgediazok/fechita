import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — prode de fútbol argentino`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(1000px circle at 15% 0%, #6845E0 0%, transparent 55%), radial-gradient(900px circle at 100% 100%, #FF4FC3 0%, transparent 50%), #0B0C16",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 132,
            fontWeight: 900,
            letterSpacing: -2,
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            fontWeight: 700,
            color: "rgba(245,245,255,0.82)",
          }}
        >
          Pronosticá. Sumá puntos. Bancá a tu club.
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 16,
            fontSize: 26,
            fontWeight: 800,
            color: "#A390FF",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          <span>Liga por fecha</span>
          <span style={{ color: "rgba(163,144,255,0.4)" }}>•</span>
          <span>Ascensos y descensos</span>
          <span style={{ color: "rgba(163,144,255,0.4)" }}>•</span>
          <span>Grupos con amigos</span>
        </div>
      </div>
    ),
    size
  );
}
