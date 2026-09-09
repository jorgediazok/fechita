// Service worker solo-push. No cachea nada (el offline completo de la PWA queda fuera de
// scope) — sirve únicamente para recibir notificaciones cuando la pestaña está cerrada.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Cómo Van";
  const options = {
    body: data.body || "",
    tag: data.tag || undefined,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: { url: data.url || "/pronosticos" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/pronosticos";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(target) && "focus" in client) return client.focus();
      }
      const anyClient = clientList.find((c) => "focus" in c);
      if (anyClient) {
        anyClient.navigate(target);
        return anyClient.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
