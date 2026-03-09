import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

declare global {
  interface ServiceWorkerRegistration {
    pushManager: any;
  }
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isIOSPWA, setIsIOSPWA] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
    const iosPWA = isIOS && isStandalone;
    setIsIOSPWA(iosPWA);

    // iOS 16.4+ supports push in PWA mode
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check if already subscribed
  useEffect(() => {
    if (!user || !isSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      } catch (e) {
        console.error("Error checking push subscription:", e);
      }
    };

    checkSubscription();
  }, [user, isSupported]);

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return false;

    setLoading(true);
    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setLoading(false);
        return false;
      }

      // Register push service worker
      const registration = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      // Get VAPID public key from edge function
      let vapidPublicKey: string | null = null;
      try {
        const { data } = await supabase.functions.invoke("get-vapid-key");
        vapidPublicKey = data?.vapidPublicKey || null;
      } catch (e) {
        console.error("Failed to fetch VAPID key:", e);
      }

      let subscription: PushSubscription | null = null;

      if (vapidPublicKey) {
        // Convert VAPID key
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      } else {
        // Subscribe without applicationServerKey (limited support)
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
        });
      }

      if (!subscription) {
        setLoading(false);
        return false;
      }

      const key = subscription.getKey("p256dh");
      const auth = subscription.getKey("auth");

      if (!key || !auth) {
        setLoading(false);
        return false;
      }

      const p256dh = arrayBufferToBase64(key);
      const authKey = arrayBufferToBase64(auth);

      // Save to database
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: p256dh,
          auth: authKey,
        },
        { onConflict: "user_id,endpoint" }
      );

      if (error) {
        console.error("Error saving push subscription:", error);
        setLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (e) {
      console.error("Error subscribing to push:", e);
      setLoading(false);
      return false;
    }
  }, [user, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();

          // Remove from database
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .eq("endpoint", subscription.endpoint);
        }
      }

      setIsSubscribed(false);
    } catch (e) {
      console.error("Error unsubscribing from push:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { isSubscribed, isSupported, permission, loading, subscribe, unsubscribe };
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
