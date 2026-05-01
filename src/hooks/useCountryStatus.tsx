import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";

interface CountryStatus {
  enabled: boolean;
  message: string;
}

export const useCountryStatus = () => {
  const { currentCountry } = useCountry();
  const [status, setStatus] = useState<CountryStatus>({ enabled: true, message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // Safety: never block the UI more than 2.5s
    const safety = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2500);

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("country_status")
          .select("is_enabled, disabled_message")
          .eq("country_name", currentCountry.name)
          .maybeSingle();

        if (!isMounted) return;

        if (!error && data) {
          setStatus({
            enabled: data.is_enabled ?? true,
            message: data.disabled_message ?? "",
          });
        } else {
          // No row = enabled by default
          setStatus({ enabled: true, message: "" });
        }
      } catch {
        if (isMounted) setStatus({ enabled: true, message: "" });
      } finally {
        clearTimeout(safety);
        if (isMounted) setLoading(false);
      }
    };

    fetchStatus();

    // Realtime updates
    const channel = supabase
      .channel(`country_status_${currentCountry.name}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "country_status" },
        () => fetchStatus()
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearTimeout(safety);
      supabase.removeChannel(channel);
    };
  }, [currentCountry.name]);

  return { status, loading, countryName: currentCountry.name };
};
