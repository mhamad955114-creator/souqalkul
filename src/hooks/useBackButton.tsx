import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

/**
 * Hook to handle the hardware back button on Android.
 * - If the user can go back in browser history, it navigates back with a light vibration.
 * - If on the root page, it shows a confirm dialog; if confirmed, exits the app.
 */
export function useBackButton() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handler = App.addListener("backButton", async ({ canGoBack }) => {
      try {
        // Give a subtle haptic tap on every back press
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        // Haptics not available – continue silently
      }

      if (canGoBack) {
        window.history.back();
      } else {
        // On root page – ask before exiting
        const shouldExit = window.confirm(
          "هل تريد الخروج من التطبيق؟" // "Do you want to exit the app?"
        );
        if (shouldExit) {
          App.exitApp();
        }
      }
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, []);
}
