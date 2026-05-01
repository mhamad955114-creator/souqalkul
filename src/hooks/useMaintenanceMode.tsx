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
    let done = false;
    // Safety: never block the UI more than 2.5s on this check
    const safety = setTimeout(() => {
      if (!done) setLoading(false);
    }, 2500);

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
        done = true;
        clearTimeout(safety);
        setLoading(false);
      }
    };

    fetchMaintenance();
    return () => clearTimeout(safety);
  }, []);

  return { maintenance, loading };
};
