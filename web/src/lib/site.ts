// URL pública del sitio, para metadata absoluta (Open Graph, sitemap, robots). En Vercel se
// setea NEXT_PUBLIC_SITE_URL con el dominio real; el fallback sirve para dev/preview.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Cómo Van";
export const SITE_DESCRIPTION =
  "Prode de fútbol argentino: pronosticá la fecha, sumá puntos y subí de categoría en la liga semanal contra otros hinchas.";
