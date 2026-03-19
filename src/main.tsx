import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isCapacitor = typeof (window as any).Capacitor !== "undefined";

const getRegistrationScriptUrl = (registration: ServiceWorkerRegistration) =>
  registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || "";

const unregisterLegacyPushWorker = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) => {
          const scriptUrl = getRegistrationScriptUrl(registration);
          return scriptUrl.includes("/push-sw.js") && registration.scope.endsWith("/");
        })
        .map((registration) => registration.unregister())
    );
  } catch {
    // ignore cleanup errors
  }
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
  }
}

createRoot(document.getElementById("root")!).render(<App />);
