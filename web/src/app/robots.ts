import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Todo lo que hay detrás del login es contenido personal — no aporta a la búsqueda
      // y no debería indexarse aunque se filtre una URL.
      disallow: ["/api/", "/pronosticos", "/liga", "/grupos", "/perfil", "/onboarding", "/verificar-email"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
