import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ListingPlan {
  duration_days: number;
  max_images: number;
  max_active_listings: number;
  price?: number;
}

export interface ListingSettings {
  free_listing: ListingPlan;
  featured_listing: ListingPlan;
  professional_listing: ListingPlan;
  
}

const defaultSettings: ListingSettings = {
  free_listing: { duration_days: 30, max_images: 5, max_active_listings: 3 },
  featured_listing: { price: 50000, duration_days: 30, max_images: 10, max_active_listings: 10 },
  professional_listing: { price: 100000, duration_days: 30, max_images: 20, max_active_listings: -1 },
  
};

export const useListingSettings = () => {
  const [settings, setSettings] = useState<ListingSettings>(defaultSettings);
  const [rawSettings, setRawSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listing_settings")
      .select("setting_key, setting_value");

    if (!error && data) {
      const s = { ...defaultSettings };
      const raw: Record<string, any> = {};
      data.forEach((row: any) => {
        raw[row.setting_key] = row.setting_value;
        const key = row.setting_key as keyof ListingSettings;
        if (s[key]) {
          s[key] = row.setting_value as ListingPlan;
        }
      });
      setSettings(s);
      setRawSettings(raw);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: ListingPlan) => {
    const { error } = await supabase
      .from("listing_settings")
      .update({ setting_value: value as any, updated_at: new Date().toISOString() })
      .eq("setting_key", key);

    if (!error) {
      setSettings((prev) => ({ ...prev, [key]: value }));
    }
    return !error;
  };

  return { settings, rawSettings, loading, updateSetting, refetch: fetchSettings };
};
