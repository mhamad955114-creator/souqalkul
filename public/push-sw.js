// Push Notification Service Worker
self.addEventListener("push", function (event) {
  let data = { title: "سوق الكل", body: "لديك إشعار جديد" };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("Error parsing push data:", e);
  }

  const options = {
    body: data.body || data.message || "لديك إشعار جديد",
    icon: data.icon || "/pwa-192x192.png",
    badge: data.badge || "/pwa-192x192.png",
    dir: "rtl",
    lang: "ar",
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      { action: "open", title: "فتح" },
      { action: "close", title: "إغلاق" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});

self.addEventListener("notificationclose", function (event) {
  // Analytics or cleanup if needed
});
