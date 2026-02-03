import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, ArrowRight, User } from "lucide-react";
import { useChat, useChatMessages } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/constants";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId?: string;
  sellerId?: string;
  listingTitle?: string;
}

const ChatModal = ({ open, onOpenChange, listingId, sellerId, listingTitle }: ChatModalProps) => {
  const { user } = useAuth();
  const { conversations, loading: convLoading, getOrCreateConversation, fetchConversations } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "chat">("list");

  // If opening for a specific listing, create/get conversation
  useEffect(() => {
    const initConversation = async () => {
      if (open && listingId && sellerId && user && sellerId !== user.id) {
        const conv = await getOrCreateConversation(listingId, sellerId);
        if (conv) {
          setSelectedConversation(conv.id);
          setView("chat");
          fetchConversations();
        }
      }
    };
    initConversation();
  }, [open, listingId, sellerId, user, getOrCreateConversation, fetchConversations]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      if (!listingId) {
        setSelectedConversation(null);
        setView("list");
      }
    }
  }, [open, listingId]);

  const handleSelectConversation = (convId: string) => {
    setSelectedConversation(convId);
    setView("chat");
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setView("list");
    fetchConversations();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[600px] flex flex-col p-0">
        {view === "list" ? (
          <>
            <DialogHeader className="p-4 border-b">
              <DialogTitle>الرسائل</DialogTitle>
            </DialogHeader>
            <ConversationList
              conversations={conversations}
              loading={convLoading}
              onSelect={handleSelectConversation}
              currentUserId={user.id}
            />
          </>
        ) : (
          <ChatView
            conversationId={selectedConversation}
            onBack={handleBackToList}
            currentUserId={user.id}
            conversations={conversations}
            listingTitle={listingTitle}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

interface ConversationListProps {
  conversations: any[];
  loading: boolean;
  onSelect: (id: string) => void;
  currentUserId: string;
}

const ConversationList = ({ conversations, loading, onSelect, currentUserId }: ConversationListProps) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
        <p className="text-center">لا توجد محادثات بعد</p>
        <p className="text-sm text-center mt-2">ابدأ محادثة من صفحة أي إعلان</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className="w-full p-4 flex gap-3 hover:bg-muted/50 transition-colors text-right"
          >
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={conv.other_user?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">
                  {conv.other_user?.full_name || "مستخدم"}
                </span>
                {conv.unread_count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conv.listing?.title || "إعلان"}
              </p>
              {conv.last_message && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {conv.last_message.sender_id === currentUserId ? "أنت: " : ""}
                  {conv.last_message.content}
                </p>
              )}
            </div>
            {conv.listing?.images?.[0] && (
              <img
                src={conv.listing.images[0]}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

interface ChatViewProps {
  conversationId: string | null;
  onBack: () => void;
  currentUserId: string;
  conversations: any[];
  listingTitle?: string;
}

const ChatView = ({ conversationId, onBack, currentUserId, conversations, listingTitle }: ChatViewProps) => {
  const { messages, loading, sendMessage } = useChatMessages(conversationId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === conversationId);
  const title = listingTitle || conversation?.listing?.title || "محادثة";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    await sendMessage(newMessage);
    setNewMessage("");
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">
            {conversation?.other_user?.full_name || "مستخدم"}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{title}</p>
        </div>
        {conversation?.listing && (
          <div className="text-left">
            <span className="text-sm font-medium text-primary">
              {formatPrice(conversation.listing.price)}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>ابدأ المحادثة الآن</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === currentUserId ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.sender_id === currentUserId
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("ar-SY", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || sending} size="icon">
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
