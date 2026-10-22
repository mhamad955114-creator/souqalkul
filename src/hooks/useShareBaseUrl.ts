import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_SHARE_URL = "https://souqalkul.lovable.app";
export const SHARE_URL_KEY = "site_share_url";

export const cleanShareUrl = (v: unknown): string => {
  const s = typeof v === "string" ? v : (v as any)?.url;
  if (typeof s !== "string" || !/^https?:\/\/[^\s]+$/i.test(s.trim())) return DEFAULT_SHARE_URL;
  return s.trim().replace(/\/+$/, "");
};

let cached: string | null = null;

export const fetchShareBaseUrl = async (): Promise<string> => {
  if (cached) return cached;
  const { data } = await supabase
    .from("listing_settings")
    .select("setting_value")
    .eq("setting_key", SHARE_URL_KEY)
    .maybeSingle();
  cached = cleanShareUrl(data?.setting_value);
  return cached;
};

export const useShareBaseUrl = () => {
  const [url, setUrl] = useState(cached || DEFAULT_SHARE_URL);
  useEffect(() => {
    fetchShareBaseUrl().then(setUrl).catch(() => {});
  }, []);
  return url;
};
