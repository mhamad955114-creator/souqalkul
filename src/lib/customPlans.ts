import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BaseTier = "featured" | "professional" | "business";

export interface CustomPlan {
  id: string;
  plan_key: string;
  base_tier: BaseTier;
  name_ar: string;
  name_en: string;
  name_tr: string;
  features_ar: string;
  features_en: string;
  features_tr: string;
  price: number;
  duration_days: number;
  max_active_listings: number;
  max_images: number;
  reward_cost: number;
  color: string;
  glow_color2: string;
  display_order: number;
  is_active: boolean;
}

let cache: CustomPlan[] = [];
let loaded = false;
let pending: Promise<CustomPlan[]> | null = null;
const listeners = new Set<(p: CustomPlan[]) => void>();

export const getCustomPlanSync = (key?: string | null) =>
  key ? cache.find((p) => p.plan_key === key) : undefined;

/** Maps a custom plan key to its base tier; built-in keys pass through. */
export const resolveBaseTier = (key?: string | null): string | null | undefined => {
  const cp = getCustomPlanSync(key);
  return cp ? cp.base_tier : key;
};

export const customPlanName = (key?: string | null, lang: string = "ar") => {
  const cp = getCustomPlanSync(key);
  if (!cp) return key ?? "";
  if (lang === "en") return cp.name_en || cp.name_ar;
  if (lang === "tr") return cp.name_tr || cp.name_en || cp.name_ar;
  return cp.name_ar;
};

export const customPlanFeatures = (cp: CustomPlan, lang: string) => {
  const raw = lang === "en" ? cp.features_en || cp.features_ar : lang === "tr" ? cp.features_tr || cp.features_en || cp.features_ar : cp.features_ar;
  return raw.split("\n").map((s) => s.trim()).filter(Boolean);
};

export const loadCustomPlans = async (force = false): Promise<CustomPlan[]> => {
  if (loaded && !force) return cache;
  if (pending && !force) return pending;
  pending = (async () => {
    const { data } = await supabase.from("custom_plans").select("*").order("display_order").order("created_at");
    cache = (data as CustomPlan[] | null) ?? [];
    loaded = true;
    pending = null;
    listeners.forEach((l) => l(cache));
    return cache;
  })();
  return pending;
};

export const useCustomPlans = () => {
  const [plans, setPlans] = useState<CustomPlan[]>(cache);
  useEffect(() => {
    listeners.add(setPlans);
    loadCustomPlans();
    return () => { listeners.delete(setPlans); };
  }, []);
  return { plans, refetch: () => loadCustomPlans(true) };
};
