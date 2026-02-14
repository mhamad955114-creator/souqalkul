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
  dating_listing: ListingPlan;
}

const defaultSettings: ListingSettings = {
  free_listing: { duration_days: 30, max_images: 5, max_active_listings: 3 },
  featured_listing: { price: 50000, duration_days: 30, max_images: 10, max_active_listings: 10 },
  professional_listing: { price: 100000, duration_days: 30, max_images: 20, max_active_listings: -1 },
  dating_listing: { price: 25000, duration_days: 30, max_images: 5, max_active_listings: 3 },
};

export const useListingSettings = () => {
  const [settings, setSettings] = useState<ListingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listing_settings")
      .select("setting_key, setting_value");

    if (!error && data) {
      const s = { ...defaultSettings };
      data.forEach((row: any) => {
        const key = row.setting_key as keyof ListingSettings;
        if (s[key]) {
          s[key] = row.setting_value as ListingPlan;
        }
      });
      setSettings(s);
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

  return { settings, loading, updateSetting, refetch: fetchSettings };
};
