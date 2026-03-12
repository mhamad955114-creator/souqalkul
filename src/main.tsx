import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Detect if running inside Capacitor native shell
const isCapacitor = typeof (window as any).Capacitor !== 'undefined';

let updateReady = false;

if ('serviceWorker' in navigator && !isCapacitor) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!updateReady) {
      updateReady = true;
      window.dispatchEvent(new Event('sw-update-ready'));
    }
  });
} else if (isCapacitor && 'serviceWorker' in navigator) {
  // Unregister any existing service workers in Capacitor to prevent white screen
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
