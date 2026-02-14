import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceConfig {
  enabled: boolean;
  message: string;
}

export const useMaintenanceMode = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>({ enabled: false, message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const { data, error } = await supabase
          .from("listing_settings")
          .select("setting_value")
          .eq("setting_key", "maintenance_mode")
          .maybeSingle();

        if (!error && data) {
          const val = data.setting_value as unknown as MaintenanceConfig;
          setMaintenance({ enabled: val.enabled ?? false, message: val.message ?? "" });
        }
      } catch {
        // If fetch fails, don't block the app
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, []);

  return { maintenance, loading };
};
