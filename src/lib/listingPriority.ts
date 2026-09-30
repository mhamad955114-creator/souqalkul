import { supabase } from "@/integrations/supabase/client";

const badgePriority: Record<string, number> = {
  business: 0,
  professional: 1,
  featured: 2,
};

/** Hours a promoted listing stays at the top. 0 = unlimited. */
export type TopDurationConfig = { featured: number; professional: number; business: number };
export const DEFAULT_TOP_DURATION: TopDurationConfig = { featured: 0, professional: 0, business: 0 };

let topDuration: TopDurationConfig = DEFAULT_TOP_DURATION;
let loadPromise: Promise<TopDurationConfig> | null = null;

export const setTopDurationCache = (c: TopDurationConfig) => { topDuration = c; };

export const loadTopDuration = (force = false) => {
  if (!loadPromise || force) {
    loadPromise = (async () => {
      try {
        const { data } = await (supabase.rpc as any)("get_top_duration_config");
        topDuration = { ...DEFAULT_TOP_DURATION, ...(data || {}) };
      } catch { /* keep defaults */ }
      return topDuration;
    })();
  }
  return loadPromise;
};

const getListingPriority = (l: { badge_type?: string | null; is_featured?: boolean | null; promoted_at?: string | null; created_at?: string }) => {
  let tier: string | null = null;
  if (l.badge_type && l.badge_type in badgePriority) tier = l.badge_type;
  else if (l.is_featured) tier = "featured";
  if (!tier) return 3;

  const hours = Number((topDuration as any)[tier]) || 0;
  if (hours > 0) {
    const start = new Date(l.promoted_at || l.created_at || 0).getTime();
    if (Date.now() - start > hours * 3600_000) return 3;
  }
  return badgePriority[tier];
};

export const sortListingsByPromotionPriority = <T extends { badge_type?: string | null; is_featured?: boolean | null; created_at?: string; promoted_at?: string | null }>(
  listings: T[]
) => {
  return [...listings].sort((a, b) => {
    const priorityDiff = getListingPriority(a) - getListingPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
};
