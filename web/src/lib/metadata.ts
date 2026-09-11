import type { Metadata, ResolvingMetadata } from "next";
import { SITE_NAME } from "./site";

// Genera la metadata de una página pública (title/description/canonical + Open Graph/Twitter
// a tono, con `url` propia — sin esto, compartir /login o /reglas mostraba el título y
// description genéricos de la home, porque Next NO mergea `openGraph` entre layout y page: si
// la page define `openGraph`, lo reemplaza entero (ver docs Next "Merging"). Por eso esto lee
// `parent` y reusa `openGraph.images` en vez de perder la imagen OG del layout — el patrón que
// documentan para "extender en vez de reemplazar".
export async function pageMetadata(
  parent: ResolvingMetadata,
  {
    title,
    description,
    path,
    absoluteTitle = false,
  }: { title: string; description: string; path: string; absoluteTitle?: boolean }
): Promise<Metadata> {
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  const images = (await parent).openGraph?.images;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, images },
    twitter: { title: fullTitle, description },
  };
}
