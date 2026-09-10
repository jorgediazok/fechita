"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchNotifications,
  markNotificationsRead,
  type NotificationsResult,
} from "@/app/notifications-actions";
import type { FeedNotification } from "@/lib/notifications";

const rtf = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });
const dateFmt = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" });

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const diffMin = Math.round((then - Date.now()) / 60000);
  const absMin = Math.abs(diffMin);
  if (absMin < 1) return "recién";
  if (absMin < 60) return rtf.format(diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, "day");
  return dateFmt.format(new Date(iso));
}

export function NotificationBell() {
  const router = useRouter();
  const [state, setState] = useState<NotificationsResult | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FeedNotification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchNotifications().then((res) => {
      if (cancelled) return;
      setState(res);
      if (res.user) {
        setItems(res.items);
        setUnread(res.unread);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const openSheet = useCallback(() => {
    setOpen(true);
    if (unread > 0) {
      setUnread(0);
      setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })));
      markNotificationsRead();
    }
  }, [unread]);

  const goTo = useCallback(
    (url: string) => {
      setOpen(false);
      router.push(url);
    },
    [router]
  );

  // Confirmada la falta de sesión → no se muestra la campana. Mientras carga se reserva el
  // lugar con el botón deshabilitado (sin salto de layout al lado de la pill de racha).
  if (state && !state.user) return null;
  const loading = !state;

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        disabled={loading}
        aria-label={unread > 0 ? `Novedades, ${unread} sin leer` : "Novedades"}
        className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 transition active:scale-90 disabled:opacity-60"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3a5 5 0 0 0-5 5c0 4-1.5 5.5-2 6.5h14c-.5-1-2-2.5-2-6.5a5 5 0 0 0-5-5z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M10 19a2 2 0 0 0 4 0" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B0C16] bg-[#FF4D6D]" />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 px-4 pb-4 pt-10 md:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Novedades"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[70vh] w-full max-w-[400px] flex-col rounded-3xl border border-[#262844] bg-[#15162A] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-[#262844] px-5 py-4">
              <h2 className="font-display text-base text-[#E4E6F7]">NOVEDADES</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-[11px] font-extrabold text-[#8A8FB2]"
              >
                CERRAR
              </button>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-5 py-10 text-center text-[13px] font-semibold text-[#8A8FB2]">
                  Todavía no hay novedades.
                </p>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => goTo(n.url)}
                        className="flex w-full gap-3 border-b border-[#1E2038] px-5 py-3.5 text-left transition active:bg-[#1A1B31]"
                      >
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            n.readAt ? "bg-transparent" : "bg-[#9B5CFF]"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-extrabold leading-snug text-[#E4E6F7]">
                            {n.title}
                          </span>
                          {n.body && (
                            <span className="mt-0.5 block text-[12px] font-semibold leading-snug text-[#9195C2]">
                              {n.body}
                            </span>
                          )}
                          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[#57628A]">
                            {relativeTime(n.sentAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
