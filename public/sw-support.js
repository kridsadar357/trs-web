/* global self, clients */
/* TRS Support PWA — push + notification click only (no caching). */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "TRS Support";
  const body = data.body || "มีข้อความใหม่";
  const url = data.url || "/";
  const tag = data.tag || "trs-support";
  const reg = self.registration;

  const show = reg.showNotification(title, {
    body,
    tag,
    renotify: true,
    icon: data.icon || "/android-chrome-192x192.png",
    badge: data.badge || "/android-chrome-192x192.png",
    data: { url },
    vibrate: [120, 80, 120],
  });

  /** Home-screen icon badge (Chrome/Edge/Android; not Safari). */
  let badgeTask = Promise.resolve();
  const n = data.appBadgeCount;
  if (typeof n === "number" && n >= 0) {
    if (reg.setAppBadge) {
      badgeTask =
        n === 0 && reg.clearAppBadge
          ? reg.clearAppBadge()
          : n === 0
            ? reg.setAppBadge(0)
            : reg.setAppBadge(n);
    }
  }

  event.waitUntil(Promise.all([show, badgeTask]).catch(() => {}));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data && event.notification.data.url;
  const path = typeof raw === "string" && raw.startsWith("/") ? raw : "/";
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const u = client.url.split("#")[0];
        if (u === target && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
