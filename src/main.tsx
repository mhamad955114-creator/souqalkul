import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

let updateReady = false;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!updateReady) {
      updateReady = true;
      // Dispatch custom event so React can show UI
      window.dispatchEvent(new Event('sw-update-ready'));
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
