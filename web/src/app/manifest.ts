import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cómo Van",
    short_name: "Cómo Van",
    description: "Prode de fútbol argentino: pronósticos, ligas semanales y rivalidad entre amigos.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#75aadb",
    lang: "es-AR",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
