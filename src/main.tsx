import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isCapacitor = typeof (window as any).Capacitor !== "undefined";
const STALE_RECOVERY_KEY = "__stale_recovery_done__";
const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Loading chunk [\d]+ failed/i,
  /Importing a module script failed/i,
];

const getRegistrationScriptUrl = (registration: ServiceWorkerRegistration) =>
  registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || "";

const unregisterRootScopeWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) => registration.scope === `${window.location.origin}/`)
        .map((registration) => registration.unregister())
    );
  } catch {
    // ignore cleanup errors
  }
};

const recoverFromStaleClient = async () => {
  if (sessionStorage.getItem(STALE_RECOVERY_KEY) === "1") return;
  sessionStorage.setItem(STALE_RECOVERY_KEY, "1");

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }
  } catch {
    // ignore recovery cleanup errors
  }

  window.location.reload();
};

const shouldRecoverByError = (errorLike: unknown) => {
  const message =
    typeof errorLike === "string"
      ? errorLike
      : errorLike instanceof Error
      ? errorLike.message
      : typeof (errorLike as { message?: unknown })?.message === "string"
      ? (errorLike as { message: string }).message
      : "";

  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

let updateReady = false;

if ("serviceWorker" in navigator) {
  if (isCapacitor) {
    // Prevent SW conflicts inside native webview
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  } else {
    unregisterLegacyPushWorker();

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!updateReady) {
        updateReady = true;
        window.dispatchEvent(new Event("sw-update-ready"));
      }
    });

    window.addEventListener("error", (event) => {
      if (shouldRecoverByError(event.error ?? event.message)) {
        recoverFromStaleClient();
      }
    });

    window.addEventListener("unhandledrejection", (event) => {
      if (shouldRecoverByError(event.reason)) {
        recoverFromStaleClient();
      }
    });

    window.setTimeout(() => {
      const root = document.getElementById("root");
      if (!root?.firstElementChild && navigator.serviceWorker.controller) {
        recoverFromStaleClient();
      }
    }, 5000);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
