import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startVersionCheck } from "./lib/versionCheck";
import { initCapgoUpdater } from "./lib/capgoUpdater";

const isCapacitor = typeof (window as any).Capacitor !== "undefined";
const CHUNK_ERROR_PATTERNS = [
  "failed to fetch dynamically imported module",
  "loading chunk",
  "chunkloaderror",
  "importing a module script failed",
];
let recovering = false;

const getRegistrationScriptUrl = (registration: ServiceWorkerRegistration) =>
  registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || "";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message.toLowerCase();
  if (typeof error === "string") return error.toLowerCase();
  try {
    return JSON.stringify(error).toLowerCase();
  } catch {
    return "";
  }
};

const isChunkError = (error: unknown) => {
  const message = getErrorMessage(error);
  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
};

const unregisterConflictingWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const rootScope = `${window.location.origin}/`;
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations
        .filter((registration) => {
          const scriptUrl = getRegistrationScriptUrl(registration);
          return (
            registration.scope === rootScope ||
            scriptUrl.includes("/sw.js") ||
            scriptUrl.includes("/workbox-") ||
            (scriptUrl.includes("/push-sw.js") && registration.scope === rootScope)
          );
        })
        .map((registration) => registration.unregister())
    );
  } catch {
    // ignore cleanup errors
  }
};

const clearBrowserCaches = async () => {
  if (!("caches" in window)) return;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  } catch {
    // ignore cache cleanup failures
  }
};

const recoverFromStaleClient = async (reason: string) => {
  if (recovering) return;
  recovering = true;

  const recoveryKey = "stale_client_recovery_done";

  try {
    if (sessionStorage.getItem(recoveryKey)) {
      console.error("Recovery already attempted in this session.", reason);
      return;
    }
    sessionStorage.setItem(recoveryKey, "1");
  } catch {
    // ignore sessionStorage access issues
  }

  try {
    await Promise.all([unregisterConflictingWorkers(), clearBrowserCaches()]);
  } catch {
    // ignore cleanup failures
  }

  window.location.reload();
};

let updateReady = false;

if ("serviceWorker" in navigator) {
  void unregisterConflictingWorkers();

  if (!isCapacitor) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!updateReady) {
        updateReady = true;
        window.dispatchEvent(new Event("sw-update-ready"));
      }
    });
  }
}

window.addEventListener("error", (event) => {
  if (isChunkError(event.error ?? event.message)) {
    void recoverFromStaleClient("window_error");
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (isChunkError(event.reason)) {
    void recoverFromStaleClient("unhandled_rejection");
  }
});

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  void recoverFromStaleClient("vite_preload_error");
});

createRoot(document.getElementById("root")!).render(<App />);

// Start polling for new app versions (works in browser & Capacitor webview)
startVersionCheck();

// On native platforms, also enable Capgo OTA updates so users get new web
// bundles inside the installed APK without needing a Play Store update.
void initCapgoUpdater();
