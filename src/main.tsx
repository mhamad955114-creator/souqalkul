import { createRoot } from "react-dom/client";
import "./index.css";

const isCapacitor = typeof (window as any).Capacitor !== "undefined";
const BOOT_TIMEOUT_MS = 8000;
const RECOVERY_QUERY_KEY = "boot_recovery";
const CHUNK_ERROR_PATTERNS = [
  "failed to fetch dynamically imported module",
  "loading chunk",
  "chunkloaderror",
  "importing a module script failed",
];

let root: ReturnType<typeof createRoot> | null = null;
let appMounted = false;
let recovering = false;

const getRegistrationScriptUrl = (registration: ServiceWorkerRegistration) =>
  registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || "";

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
};

const ensureStorageAccess = () => {
  const safePatch = (storageName: "localStorage" | "sessionStorage") => {
    try {
      const storage = window[storageName];
      const testKey = "__boot_test__";
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
    } catch {
      try {
        Object.defineProperty(window, storageName, {
          value: createMemoryStorage(),
          configurable: true,
        });
      } catch {
        // ignore storage patch failures
      }
    }
  };

  safePatch("localStorage");
  safePatch("sessionStorage");
};

const getRoot = () => {
  const container = document.getElementById("root");
  if (!container) throw new Error("Root element not found");
  if (!root) root = createRoot(container);
  return root;
};

const hasRecoveryQuery = () => new URL(window.location.href).searchParams.has(RECOVERY_QUERY_KEY);

const clearRecoveryQuery = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(RECOVERY_QUERY_KEY)) return;
  url.searchParams.delete(RECOVERY_QUERY_KEY);
  window.history.replaceState({}, "", url.toString());
};

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

const renderFatalBootScreen = () => {
  const container = document.getElementById("root");
  if (!container) return;

  container.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:hsl(0 0% 98%);font-family:Cairo,system-ui,sans-serif;">
      <div style="width:100%;max-width:420px;background:hsl(0 0% 100%);border:1px solid hsl(220 13% 91%);border-radius:16px;padding:20px;text-align:center;box-shadow:0 8px 26px -10px hsla(220,20%,10%,0.18);">
        <h1 style="margin:0 0 8px;font-size:22px;color:hsl(220 20% 10%);font-weight:800;">تعذر تشغيل التطبيق</h1>
        <p style="margin:0 0 16px;color:hsl(220 10% 40%);line-height:1.7;">تم اكتشاف خطأ يمنع التحميل. اضغط إعادة المحاولة لتحديث الصفحة.</p>
        <button id="boot-retry-btn" style="width:100%;height:44px;border:0;border-radius:12px;background:hsl(24 95% 53%);color:hsl(0 0% 100%);font-size:15px;font-weight:700;cursor:pointer;">إعادة المحاولة</button>
      </div>
    </div>
  `;

  const retryButton = document.getElementById("boot-retry-btn");
  retryButton?.addEventListener("click", () => {
    window.location.reload();
  });
};

const recoverFromStaleClient = async (reason: string) => {
  if (recovering) return;
  recovering = true;

  if (hasRecoveryQuery()) {
    console.error("Recovery already attempted, showing fatal screen.", reason);
    renderFatalBootScreen();
    return;
  }

  try {
    await Promise.all([unregisterConflictingWorkers(), clearBrowserCaches()]);
  } finally {
    const url = new URL(window.location.href);
    url.searchParams.set(RECOVERY_QUERY_KEY, "1");
    window.location.replace(url.toString());
  }
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

const mountApp = async () => {
  ensureStorageAccess();

  try {
    const { default: App } = await import("./App.tsx");
    getRoot().render(<App />);
    appMounted = true;
    clearRecoveryQuery();
  } catch (error) {
    console.error("App bootstrap failed:", error);

    if (isChunkError(error)) {
      await recoverFromStaleClient("bootstrap_chunk_error");
      return;
    }

    renderFatalBootScreen();
  }
};

void mountApp();

window.setTimeout(() => {
  if (appMounted || !("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;
  void recoverFromStaleClient("boot_timeout");
}, BOOT_TIMEOUT_MS);
