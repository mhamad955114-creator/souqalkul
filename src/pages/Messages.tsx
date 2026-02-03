import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatModal from "@/components/ChatModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle, User } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { formatPrice } from "@/lib/constants";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    listingTitle: string;
  } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleOpenChat = (convId: string, listingTitle: string) => {
    setSelectedConversation({ id: convId, listingTitle });
    setChatOpen(true);
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} د`;
    if (diffHours < 24) return `منذ ${diffHours} س`;
    if (diffDays < 7) return `منذ ${diffDays} ي`;
    return date.toLocaleDateString("ar-SY");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">الرسائل</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">لا توجد رسائل</h2>
              <p className="text-muted-foreground text-center">
                ابدأ محادثة من صفحة أي إعلان للتواصل مع البائع
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleOpenChat(conv.id, conv.listing?.title || "إعلان")}
                    className="w-full p-4 flex gap-4 hover:bg-muted/50 transition-colors text-right"
                  >
                    <Avatar className="h-14 w-14 flex-shrink-0">
                      <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-foreground truncate">
                          {conv.other_user?.full_name || "مستخدم"}
                        </span>
                        <div className="flex items-center gap-2">
                          {conv.last_message && (
                            <span className="text-xs text-muted-foreground">
                              {getTimeSince(conv.last_message.created_at)}
                            </span>
                          )}
                          {conv.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-primary truncate mb-1">
                        {conv.listing?.title || "إعلان"} - {conv.listing ? formatPrice(conv.listing.price) : ""}
                      </p>

                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message.sender_id === user.id ? "أنت: " : ""}
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>

                    {conv.listing?.images?.[0] && (
                      <img
                        src={conv.listing.images[0]}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </main>

      <Footer />

      {selectedConversation && (
        <ChatModal
          open={chatOpen}
          onOpenChange={(open) => {
            setChatOpen(open);
            if (!open) setSelectedConversation(null);
          }}
          listingTitle={selectedConversation.listingTitle}
        />
      )}
    </div>
  );
};

export default Messages;
