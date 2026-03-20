import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isCapacitor = typeof (window as any).Capacitor !== "undefined";

const getRegistrationScriptUrl = (registration: ServiceWorkerRegistration) =>
  registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || "";

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

let updateReady = false;

if ("serviceWorker" in navigator) {
  unregisterConflictingWorkers();

  if (!isCapacitor) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!updateReady) {
        updateReady = true;
        window.dispatchEvent(new Event("sw-update-ready"));
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
