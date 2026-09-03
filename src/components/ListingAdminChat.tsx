import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { notifyAdmins } from "@/lib/notifyAdmins";

export interface AdminListingMessage {
  id: string;
  listing_id: string;
  owner_id: string;
  sender_id: string;
  is_from_admin: boolean;
  body: string;
  read_at: string | null;
  created_at: string;
}

interface ListingAdminChatProps {
  listingId: string;
  ownerId: string;
  listingTitle?: string;
  /** true when rendered inside the admin dashboard */
  asAdmin?: boolean;
  className?: string;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ListingAdminChat = ({
  listingId,
  ownerId,
  listingTitle,
  asAdmin = false,
  className,
}: ListingAdminChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminListingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("listing_admin_messages")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: true });

    if (!error) setMessages((data as AdminListingMessage[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();

    const channel = supabase
      .channel(`listing-admin-messages-${listingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "listing_admin_messages",
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const next = payload.new as AdminListingMessage;
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  // Mark the other side's messages as read.
  useEffect(() => {
    if (!user || messages.length === 0) return;
    const unread = messages.filter(
      (m) => !m.read_at && m.is_from_admin !== asAdmin
    );
    if (unread.length === 0) return;
    (async () => {
      const stamp = new Date().toISOString();
      await supabase
        .from("listing_admin_messages")
        .update({ read_at: stamp })
        .in(
          "id",
          unread.map((m) => m.id)
        );
      setMessages((prev) =>
        prev.map((m) =>
          unread.some((u) => u.id === m.id) ? { ...m, read_at: stamp } : m
        )
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, user, asAdmin]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text || !user) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("listing_admin_messages")
        .insert({
          listing_id: listingId,
          owner_id: ownerId,
          sender_id: user.id,
          is_from_admin: asAdmin,
          body: text,
        })
        .select("*")
        .single();

      if (error) throw error;

      setMessages((prev) =>
        prev.some((m) => m.id === (data as AdminListingMessage).id)
          ? prev
          : [...prev, data as AdminListingMessage]
      );
      setBody("");

      if (asAdmin) {
        // Notify the listing owner about the new admin message.
        await supabase.from("notifications").insert({
          user_id: ownerId,
          title: "رسالة من الإدارة",
          message: listingTitle
            ? `لديك رسالة من الإدارة بخصوص إعلان "${listingTitle}"`
            : "لديك رسالة من الإدارة بخصوص أحد إعلاناتك",
          type: "admin_message",
          related_id: listingId,
        });
      } else {
        await notifyAdmins({
          title: "رد من صاحب إعلان",
          message: listingTitle
            ? `رد جديد على رسالة الإدارة بخصوص إعلان "${listingTitle}"`
            : "رد جديد على رسالة الإدارة بخصوص إعلان",
          type: "admin_message_reply",
          relatedId: listingId,
        });
      }

      toast.success("تم إرسال الرسالة");
    } catch {
      toast.error("تعذر إرسال الرسالة");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {asAdmin ? "مراسلة صاحب الإعلان" : "رسائل الإدارة"}
          </h3>
          {messages.length > 0 && (
            <Badge variant="secondary">{messages.length} رسالة</Badge>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {asAdmin
                ? "لا توجد رسائل. اكتب رسالة لصاحب الإعلان."
                : "لا توجد رسائل من الإدارة حتى الآن."}
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.is_from_admin === asAdmin;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.is_from_admin
                        ? "bg-primary/10 text-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground">
                      {m.is_from_admin ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <UserIcon className="h-3 w-3" />
                      )}
                      <span>{m.is_from_admin ? "الإدارة" : "صاحب الإعلان"}</span>
                      <span dir="ltr">{formatTime(m.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={asAdmin ? "اكتب رسالة لصاحب الإعلان..." : "اكتب ردك للإدارة..."}
            rows={3}
            maxLength={2000}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className="w-full"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            إرسال
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingAdminChat;
