import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Get all conversations for this user
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (!convs || convs.length === 0) {
      setUnreadCount(0);
      return;
    }

    const convIds = convs.map((c) => c.id);

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    setUnreadCount(count || 0);
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();

    if (!user) return;

    // Listen for new messages in realtime
    const channel = supabase
      .channel("unread-messages-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return { unreadCount, refetch: fetchUnreadCount };
}
