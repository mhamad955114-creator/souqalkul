/*
  Emergency self-destruct Service Worker for legacy root-scope SWs.
  This file intentionally unregisters itself and clears caches so old
  stale cached shells can't keep users on a white screen after deploys.
*/

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch {
        // ignore
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.registration.unregister();
      } catch {
        // ignore
      }

      try {
        const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of clientsList) {
          client.navigate(client.url);
        }
      } catch {
        // ignore
      }
    })()
  );
});

self.addEventListener("fetch", () => {
  // intentionally no caching: this worker should be short-lived.
});
