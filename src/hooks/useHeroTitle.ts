import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultHeroTitles, normalizeHeroTitles } from "@/lib/heroTitle";

export const heroTitleQueryKey = ["home-hero-title"];

export function useHeroTitle() {
  return useQuery({
    queryKey: heroTitleQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from("listing_settings")
        .select("setting_value").eq("setting_key", "hero_title").maybeSingle();
      if (error) throw error;
      return normalizeHeroTitles(data?.setting_value);
    },
    placeholderData: defaultHeroTitles,
    refetchInterval: 60000,
  });
}