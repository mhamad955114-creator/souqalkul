// Capgo OTA (Over-The-Air) updates integration.
//
// This downloads new web bundles in the background while the user uses the
// app. When a new bundle is ready, we dispatch the same `sw-update-ready`
// event the existing UpdateNotification component already listens to, so
// the user sees the familiar "تحديث جديد متاح" banner. Tapping "تحديث الآن"
// will trigger a reload that activates the freshly downloaded bundle.
//
// Native-only: Capgo's plugin no-ops on web — the existing
// startVersionCheck() flow continues to handle browser/PWA updates.

import { Capacitor } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";

let initialized = false;

const dispatchUpdateReady = () => {
  try {
    window.dispatchEvent(new Event("sw-update-ready"));
  } catch {
    // ignore
  }
};

export const initCapgoUpdater = async () => {
  if (initialized) return;
  if (!Capacitor.isNativePlatform()) return;
  initialized = true;

  try {
    // Tell Capgo the app booted successfully so it doesn't roll back to the
    // previous bundle. Must be called on every cold start.
    await CapacitorUpdater.notifyAppReady();
  } catch (err) {
    console.warn("[Capgo] notifyAppReady failed", err);
  }

  // A new bundle finished downloading in the background → prompt the user.
  CapacitorUpdater.addListener("updateAvailable", () => {
    dispatchUpdateReady();
  });

  // Some Capgo versions also emit this once the download completes.
  // Listen defensively in case the event name differs across plugin versions.
  // @ts-ignore — older typings may not include this event
  CapacitorUpdater.addListener?.("downloadComplete", () => {
    dispatchUpdateReady();
  });

  // When the app comes back to the foreground, Capgo automatically checks
  // for updates (default behavior). We also force a check on cold start.
  try {
    const latest = await CapacitorUpdater.getLatest();
    if (latest?.url) {
      // A newer version exists on the server — Capgo will download it
      // automatically; we just surface the prompt once it's ready.
      // (No manual download call needed in autoUpdate mode.)
    }
  } catch {
    // No newer version, or offline — silent.
  }
};

/**
 * Apply the downloaded Capgo bundle by reloading the webview into it.
 * Falls back to a normal reload on web or if the call fails.
 */
export const reloadIntoLatestBundle = async () => {
  if (!Capacitor.isNativePlatform()) {
    window.location.reload();
    return;
  }
  try {
    // Reloads the native webview into the most recently downloaded bundle.
    await CapacitorUpdater.reload();
  } catch (err) {
    console.warn("[Capgo] reload failed, falling back to window.reload", err);
    window.location.reload();
  }
};
