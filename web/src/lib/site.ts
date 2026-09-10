// URL pública del sitio, para metadata absoluta (Open Graph, sitemap, robots). En Vercel se
// setea NEXT_PUBLIC_SITE_URL con el dominio real; el fallback sirve para dev/preview.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Fechita";
export const SITE_DESCRIPTION =
  "Prode de fútbol argentino: pronosticá la fecha, sumá puntos y subí de categoría en la liga contra otros hinchas.";

// Casilla de contacto para "sugerencias / reportar un problema". TODO: mail real antes del
// lanzamiento (idealmente del dominio propio).
export const CONTACT_EMAIL = "hola@fechita.app";

// Versión de la app, para el pie del perfil. Espeja package.json.
export const APP_VERSION = "0.1.0";
