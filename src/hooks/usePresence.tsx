import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { RealtimeChannel } from "@supabase/supabase-js";

const CHANNEL_NAME = "online-presence";

// Singleton state shared across all hook instances
let sharedChannel: RealtimeChannel | null = null;
let subscriberCount = 0;
let sharedOnlineUsers = new Set<string>();
const listeners = new Set<(users: Set<string>) => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn(new Set(sharedOnlineUsers)));
}

function ensureChannel(userId: string) {
  subscriberCount++;
  if (sharedChannel) return;

  const channel = supabase.channel(CHANNEL_NAME, {
    config: { presence: { key: userId } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      sharedOnlineUsers = new Set(Object.keys(state));
      notifyListeners();
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: userId });
      }
    });

  sharedChannel = channel;
}

function releaseChannel() {
  subscriberCount--;
  if (subscriberCount <= 0 && sharedChannel) {
    sharedChannel.untrack();
    supabase.removeChannel(sharedChannel);
    sharedChannel = null;
    subscriberCount = 0;
    sharedOnlineUsers = new Set();
  }
}

export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(sharedOnlineUsers);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    listeners.add(setOnlineUsers);
    ensureChannel(user.id);

    // Sync initial state
    setOnlineUsers(new Set(sharedOnlineUsers));

    return () => {
      listeners.delete(setOnlineUsers);
      releaseChannel();
    };
  }, [user]);

  const isOnline = useCallback(
    (userId: string) => onlineUsers.has(userId),
    [onlineUsers]
  );

  return { onlineUsers, isOnline, onlineCount: onlineUsers.size };
};
