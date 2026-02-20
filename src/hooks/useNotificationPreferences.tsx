import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface NotificationPreferences {
  messages: boolean;
  updates: boolean;
  offers: boolean;
  admin_alerts: boolean;
}

const defaultPrefs: NotificationPreferences = {
  messages: true,
  updates: true,
  offers: true,
  admin_alerts: true,
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("messages, updates, offers, admin_alerts")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setPreferences(data);
      }
    } catch (e) {
      console.error("Error fetching notification preferences:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      if (!user) return;
      setSaving(true);

      const updated = { ...preferences, [key]: value };
      setPreferences(updated);

      try {
        const { error } = await supabase
          .from("notification_preferences")
          .upsert(
            {
              user_id: user.id,
              ...updated,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (error) {
          console.error("Error saving preference:", error);
          setPreferences(preferences); // revert
        }
      } catch (e) {
        console.error("Error saving preference:", e);
        setPreferences(preferences);
      } finally {
        setSaving(false);
      }
    },
    [user, preferences]
  );

  return { preferences, loading, saving, updatePreference };
};
