import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Registers the Android/iOS app for real push notifications (FCM) and saves the device token. */
export const NativePushRegistrar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive !== "granted") return;

        await PushNotifications.createChannel?.({
          id: "default", name: "Notifications", importance: 5, visibility: 1, sound: "default",
        }).catch(() => {});

        const reg = await PushNotifications.addListener("registration", async (t) => {
          await supabase.from("push_subscriptions").upsert(
            { user_id: user.id, endpoint: `fcm:${t.value}`, p256dh: "fcm", auth: "fcm" },
            { onConflict: "user_id,endpoint" },
          );
        });
        const err = await PushNotifications.addListener("registrationError", (e) =>
          console.error("Push registration error", e),
        );
        const tap = await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
          const url = a.notification?.data?.url;
          if (typeof url === "string" && url.startsWith("/")) navigate(url);
        });
        await PushNotifications.register();
        cleanup = () => { reg.remove(); err.remove(); tap.remove(); };
      } catch (e) {
        console.error("Native push setup failed", e);
      }
    })();
    return () => cleanup?.();
  }, [user, navigate]);

  return null;
};
