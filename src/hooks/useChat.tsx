import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listing?: {
    id: string;
    title: string;
    images: string[] | null;
    price: number;
  };
  other_user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: Message;
  unread_count?: number;
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: convData, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (!convData) {
        setConversations([]);
        return;
      }

      // Fetch additional data for each conversation
      const enrichedConversations = await Promise.all(
        convData.map(async (conv) => {
          // Get listing info
          const { data: listingData } = await supabase
            .from("listings")
            .select("id, title, images, price")
            .eq("id", conv.listing_id)
            .maybeSingle();

          // Get other user's profile
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", otherUserId)
            .maybeSingle();

          // Get last message
          const { data: lastMessageData } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .neq("sender_id", user.id);

          return {
            ...conv,
            listing: listingData || undefined,
            other_user: profileData || undefined,
            last_message: lastMessageData || undefined,
            unread_count: count || 0,
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getOrCreateConversation = async (listingId: string, sellerId: string) => {
    if (!user) return null;

    // Check if conversation exists
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("*")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (existingConv) {
      return existingConv;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return newConv;
  };

  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
  }, [conversations]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  return {
    conversations,
    loading,
    fetchConversations,
    getOrCreateConversation,
    getTotalUnreadCount,
  };
};

export const useChatMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
          .eq("is_read", false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return null;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return null;
    }

    // Update conversation updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data;
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          
          // Mark as read if not sender
          if (user && payload.new.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages, user]);

  return {
    messages,
    loading,
    sendMessage,
    fetchMessages,
  };
};
