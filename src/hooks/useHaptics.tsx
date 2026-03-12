import { useCallback } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

/**
 * Hook that returns easy-to-use haptic feedback functions.
 * Falls back silently on platforms that don't support haptics (web).
 */
export function useHaptics() {
  const isNative = Capacitor.isNativePlatform();

  const vibrate = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.vibrate();
    } catch {
      // ignore
    }
  }, [isNative]);

  const lightTap = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // ignore
    }
  }, [isNative]);

  const mediumTap = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // ignore
    }
  }, [isNative]);

  const heavyTap = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      // ignore
    }
  }, [isNative]);

  const successNotification = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // ignore
    }
  }, [isNative]);

  const warningNotification = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {
      // ignore
    }
  }, [isNative]);

  const errorNotification = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      // ignore
    }
  }, [isNative]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    successNotification,
    warningNotification,
    errorNotification,
  };
}
