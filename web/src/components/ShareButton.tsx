"use client";

import { useState } from "react";

// Compartir el perfil: usa el share nativo del sistema si está (mobile), y si no copia el
// texto al portapapeles. Texto e URL vienen del server (nombre y dominio del sitio).
export function ShareButton({ text, url }: { text: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // cancelado o no permitido — caemos al portapapeles
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin portapapeles disponible — no hacemos nada
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="w-full rounded-2xl bg-[#1F2038] py-3.5 text-sm font-bold text-[#9195C2]"
    >
      {copied ? "¡Copiado!" : "Compartir mi perfil"}
    </button>
  );
}
