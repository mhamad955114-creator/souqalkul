import { Capacitor, registerPlugin } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { toast } from "sonner";

const APP_URL = "https://souqalkul.lovable.app";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.souqalkul";
const SHARE_TEXT = `حمّل تطبيق سوق الكل - أفضل سوق إلكتروني للبيع والشراء!\n\n📲 Google Play:\n${PLAY_STORE_URL}\n\n🌐 الموقع:\n${APP_URL}`;

/**
 * Typed interface for our custom native ShareApk plugin.
 * On Android it copies the installed APK to cache and shares it as a file.
 */
interface ShareApkPlugin {
  share(): Promise<void>;
}

const ShareApk = registerPlugin<ShareApkPlugin>("ShareApk");

/**
 * Share the app.
 *
 * - **Android (native)**: shares the actual APK file via the system share sheet
 *   so the recipient can install the app directly (Bluetooth, WhatsApp, Nearby Share, etc.)
 * - **iOS (native)**: shares the app URL via the native share sheet
 * - **Web**: uses navigator.share, falls back to clipboard copy
 */
export async function shareApp(): Promise<void> {
  // --- Native Android: share the APK binary ---
  if (Capacitor.getPlatform() === "android") {
    try {
      await ShareApk.share();
      return;
    } catch (err) {
      console.warn("ShareApk plugin failed, falling back to link share", err);
      // Fall through to Share plugin
      try {
        await Share.share({
          title: "سوق الكل",
          text: SHARE_TEXT,
          url: PLAY_STORE_URL,
          dialogTitle: "مشاركة تطبيق سوق الكل",
        });
        return;
      } catch {
        // fall through to web
      }
    }
  }

  // --- iOS native share ---
  if (Capacitor.getPlatform() === "ios") {
    try {
      await Share.share({
        title: "سوق الكل",
        text: SHARE_TEXT,
        url: PLAY_STORE_URL,
        dialogTitle: "مشاركة تطبيق سوق الكل",
      });
      return;
    } catch {
      // fall through to web
    }
  }

  // --- Web share API ---
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "سوق الكل",
        text: "تطبيق سوق الكل - أفضل سوق إلكتروني للبيع والشراء",
        url: APP_URL,
      });
      return;
    } catch {
      // user cancelled or unsupported
    }
  }

  // --- Last resort: clipboard ---
  try {
    await navigator.clipboard.writeText(APP_URL);
    toast.success("تم نسخ رابط التطبيق");
  } catch {
    toast.error("تعذر مشاركة التطبيق");
  }
}
