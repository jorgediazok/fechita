"use client";

import { useCallback, useEffect, useState } from "react";
import {
  savePushSubscription,
  removePushSubscription,
  sendTestNotification,
} from "@/app/perfil/push-actions";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const NUDGE_DISMISSED_KEY = "push-nudge-dismissed";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(VAPID_PUBLIC)
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

async function getRegistration() {
  return (
    (await navigator.serviceWorker.getRegistration()) ??
    (await navigator.serviceWorker.register("/sw.js"))
  );
}

// Suscribe este dispositivo y lo guarda en el server. Devuelve true si quedó activo.
async function enablePush(): Promise<"on" | "denied" | "error"> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    const reg = await getRegistration();
    await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!),
      });
    }

    const res = await savePushSubscription(
      sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } },
      navigator.userAgent
    );
    return res.ok ? "on" : "error";
  } catch {
    return "error";
  }
}

async function disablePush() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    const endpoint = sub?.endpoint;
    await sub?.unsubscribe();
    await removePushSubscription(endpoint);
  } catch {
    // best effort
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Registra el service worker en cuanto carga cualquier pantalla (silencioso, sin
// pedir permiso). Si el permiso ya está dado, re-sincroniza la suscripción al server.
// ─────────────────────────────────────────────────────────────────────────────
export function PushRegistrar() {
  useEffect(() => {
    if (!pushSupported()) return;
    let cancelled = false;

    (async () => {
      try {
        const reg = await getRegistration();
        if (cancelled || Notification.permission !== "granted") return;
        await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await savePushSubscription(
            sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } },
            navigator.userAgent
          );
        }
      } catch {
        // no pasa nada — el toggle de /perfil vuelve a intentar
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle de /perfil.
// ─────────────────────────────────────────────────────────────────────────────
type ToggleStatus =
  | "loading"
  | "unsupported"
  | "ios-not-installed"
  | "denied"
  | "on"
  | "off";

async function computeToggleStatus(): Promise<ToggleStatus> {
  if (isIOS() && !isStandalone()) return "ios-not-installed";
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const reg = await getRegistration();
    const sub = await reg.pushManager.getSubscription();
    return sub && Notification.permission === "granted" ? "on" : "off";
  } catch {
    return "off";
  }
}

export function PushToggle() {
  const [status, setStatus] = useState<ToggleStatus>("loading");
  const [busy, setBusy] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    computeToggleStatus().then((next) => {
      if (!cancelled) setStatus(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setTestMsg(null);
    if (status === "on") {
      await disablePush();
      setStatus("off");
    } else {
      const next = await enablePush();
      setStatus(next === "on" ? "on" : next === "denied" ? "denied" : "off");
    }
    setBusy(false);
  }, [busy, status]);

  const sendTest = useCallback(async () => {
    setTestMsg(null);
    const res = await sendTestNotification();
    setTestMsg(res.ok ? "Enviada — fijate la notificación." : "No se pudo enviar.");
  }, []);

  const rowBase =
    "flex items-center gap-3 rounded-2xl bg-[#15162A] px-4 py-3.5 text-left";

  if (status === "loading") {
    return <div className={`${rowBase} opacity-40`}>{icon()}<span className="flex-1 text-sm font-bold text-[#E4E6F7]">Notificaciones</span></div>;
  }

  if (status === "unsupported" || status === "ios-not-installed" || status === "denied") {
    const help =
      status === "ios-not-installed"
        ? "Instalá la app en tu pantalla de inicio para poder activarlas."
        : status === "denied"
          ? "Las bloqueaste. Activalas desde los ajustes del navegador para este sitio."
          : "Tu navegador no soporta notificaciones.";
    return (
      <div className={rowBase}>
        {icon()}
        <span className="flex-1">
          <span className="block text-sm font-bold text-[#E4E6F7]">Notificaciones</span>
          <span className="mt-0.5 block text-[11px] font-semibold leading-snug text-[#8A8FB2]">
            {help}
          </span>
        </span>
      </div>
    );
  }

  const on = status === "on";
  return (
    <div className="flex flex-col gap-1.5">
      <button type="button" onClick={toggle} disabled={busy} className={`${rowBase} disabled:opacity-50`}>
        {icon(on)}
        <span className="flex-1">
          <span className="block text-sm font-bold text-[#E4E6F7]">Notificaciones</span>
          <span className="mt-0.5 block text-[11px] font-semibold leading-snug text-[#8A8FB2]">
            {on ? "Cierre de fecha, puntos e insignias." : "Activá para no perderte el cierre de la fecha."}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`relative h-6 w-10 shrink-0 rounded-full transition ${on ? "bg-[#7C5CFF]" : "bg-[#2A2C48]"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`}
          />
        </span>
      </button>

      {on && (
        <div className="flex items-center gap-3 px-4">
          <button
            type="button"
            onClick={sendTest}
            className="text-[11px] font-extrabold text-[#A390FF] underline underline-offset-2"
          >
            Enviar una de prueba
          </button>
          {testMsg && <span className="text-[11px] font-semibold text-[#8A8FB2]">{testMsg}</span>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tarjeta suave en /pronosticos la primera vez (post-onboarding).
// ─────────────────────────────────────────────────────────────────────────────
export function PushNudge() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (!pushSupported() || (isIOS() && !isStandalone())) return;
      if (Notification.permission !== "default") return;
      try {
        if (localStorage.getItem(NUDGE_DISMISSED_KEY)) return;
      } catch {
        // sin localStorage — mostramos igual
      }
      setShow(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(NUDGE_DISMISSED_KEY, "1");
    } catch {
      /* noop */
    }
    setShow(false);
  };

  const activate = async () => {
    if (busy) return;
    setBusy(true);
    await enablePush();
    dismiss();
  };

  return (
    <div className="mx-4.5 mt-3 flex items-center gap-2.5 rounded-2xl border border-[#7C5CFF]/40 bg-[#15132A] px-3.5 py-3">
      {icon(true)}
      <div className="flex-1">
        <p className="text-[12px] font-bold leading-snug text-[#CFC6FF]">
          Enterate cuando cierra la fecha y cuando sumás puntos.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={activate}
            disabled={busy}
            className="rounded-lg bg-[#7C5CFF] px-3 py-1 text-[11px] font-extrabold text-white disabled:opacity-50"
          >
            Activar
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg bg-[#1F2038] px-3 py-1 text-[11px] font-extrabold text-[#9195C2]"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}

function icon(active = false) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={
        active
          ? { background: "linear-gradient(145deg, #6845E0, #9B5CFF)" }
          : { background: "#1F2038" }
      }
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3a5 5 0 0 0-5 5c0 4-1.5 5.5-2 6.5h14c-.5-1-2-2.5-2-6.5a5 5 0 0 0-5-5z"
          stroke={active ? "#FFFFFF" : "#A390FF"}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M10 19a2 2 0 0 0 4 0"
          stroke={active ? "#FFFFFF" : "#A390FF"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
