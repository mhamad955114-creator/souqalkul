import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ListingAiThread {
  id: string;
  updated_at: string;
  messageCount: number;
}

/**
 * Returns the saved AI conversation linked to a listing (if any),
 * so the user can jump back to it from the listing page.
 */
export const useListingAiThread = (listingId?: string | null) => {
  const { user } = useAuth();
  const [thread, setThread] = useState<ListingAiThread | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchThread = useCallback(async () => {
    if (!user || !listingId) {
      setThread(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("ai_threads")
        .select("id, updated_at")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) {
        setThread(null);
        return;
      }

      const { count } = await supabase
        .from("ai_messages")
        .select("id", { count: "exact", head: true })
        .eq("thread_id", data.id);

      setThread({ id: data.id, updated_at: data.updated_at, messageCount: count || 0 });
    } catch {
      setThread(null);
    } finally {
      setLoading(false);
    }
  }, [user, listingId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  return { thread, loading, refetch: fetchThread };
};
