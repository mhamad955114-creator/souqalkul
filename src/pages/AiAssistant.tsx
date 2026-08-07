import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Send, Trash2, MessagesSquare, Bot } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Thread {
  id: string;
  title: string;
  updated_at: string;
  listing_id?: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ListingContext {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string | null;
  category: string;
  city: string;
  area: string | null;
  country: string;
  status: string | null;
  metadata: Record<string, unknown> | null;
}

const SUGGESTIONS = [
  "ما هو السعر المناسب لسيارة مستعملة موديل 2015؟",
  "اكتب لي وصفاً جاذباً لإعلان هاتف مستعمل",
  "كيف أتفاوض على السعر بأمان؟",
];

const LISTING_SUGGESTIONS = [
  "هل سعر هذا الإعلان مناسب؟",
  "ما الأسئلة التي يجب أن أسألها البائع؟",
  "أعد كتابة وصف هذا الإعلان بشكل أفضل",
];


const AiAssistant = () => {
  const { threadId } = useParams<{ threadId?: string }>();
  const [searchParams] = useSearchParams();
  const listingParam = searchParams.get("listing");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listingHandledRef = useRef<string | null>(null);

  const loadThreads = async () => {
    const { data } = await supabase
      .from("ai_threads")
      .select("id, title, updated_at, listing_id")
      .order("updated_at", { ascending: false });
    setThreads((data as Thread[]) || []);
    return (data as Thread[]) || [];
  };

  // Bootstrap: load threads and make sure a thread route is active.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    (async () => {
      const list = await loadThreads();

      // Opened from a listing → start a dedicated thread bound to that listing.
      if (listingParam && listingHandledRef.current !== listingParam) {
        listingHandledRef.current = listingParam;
        const existing = list.find((t) => t.listing_id === listingParam);
        if (existing) {
          navigate(`/ai/${existing.id}`, { replace: true });
          return;
        }
        const { data, error } = await supabase
          .from("ai_threads")
          .insert({ user_id: user.id, listing_id: listingParam, title: "سؤال عن إعلان" })
          .select("id, title, updated_at, listing_id")
          .single();
        if (error || !data) {
          toast.error("تعذّر إنشاء محادثة");
          return;
        }
        setThreads((prev) => [data as Thread, ...prev]);
        navigate(`/ai/${(data as Thread).id}`, { replace: true });
        return;
      }

      if (!threadId) {
        if (list.length > 0) {
          navigate(`/ai/${list[0].id}`, { replace: true });
        } else {
          const { data, error } = await supabase
            .from("ai_threads")
            .insert({ user_id: user.id })
            .select("id, title, updated_at, listing_id")
            .single();
          if (error) {
            toast.error("تعذّر إنشاء محادثة");
            return;
          }
          setThreads([data as Thread]);
          navigate(`/ai/${(data as Thread).id}`, { replace: true });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, threadId, listingParam]);

  // Load the active thread's linked listing (context sent with every message).
  useEffect(() => {
    if (!threadId || !user) {
      setListing(null);
      return;
    }
    (async () => {
      const { data: thread } = await supabase
        .from("ai_threads")
        .select("listing_id")
        .eq("id", threadId)
        .maybeSingle();
      const linkedId = (thread as { listing_id?: string | null } | null)?.listing_id;
      if (!linkedId) {
        setListing(null);
        return;
      }
      const { data: listingData } = await supabase
        .from("listings")
        .select("id, title, description, price, currency, category, city, area, country, status, metadata")
        .eq("id", linkedId)
        .maybeSingle();
      setListing((listingData as ListingContext) || null);
    })();
  }, [threadId, user]);

  // Human-readable listing context handed to the model on every turn.
  const listingContext = useMemo(() => {
    if (!listing) return undefined;
    const lines = [
      `العنوان: ${listing.title}`,
      `السعر: ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(listing.price)} ${listing.currency || ""}`.trim(),
      `القسم: ${listing.category}`,
      `الموقع: ${[listing.area, listing.city, listing.country].filter(Boolean).join("، ")}`,
      listing.status ? `الحالة: ${listing.status}` : "",
      listing.description ? `الوصف: ${listing.description.slice(0, 1200)}` : "",
    ];
    if (listing.metadata && typeof listing.metadata === "object") {
      const details = Object.entries(listing.metadata)
        .filter(([, v]) => v !== null && v !== "" && typeof v !== "object")
        .map(([k, v]) => `${k}: ${v}`)
        .slice(0, 20);
      if (details.length) lines.push(`مواصفات: ${details.join(" | ")}`);
    }
    return lines.filter(Boolean).join("\n");
  }, [listing]);

  // Load the active thread's messages.
  useEffect(() => {
    if (!threadId || !user) return;
    setLoadingMessages(true);
    setStreaming("");
    (async () => {
      const { data, error } = await supabase
        .from("ai_messages")
        .select("id, role, content")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) toast.error("تعذّر تحميل الرسائل");
      setMessages((data as Message[]) || []);
      setLoadingMessages(false);
      inputRef.current?.focus();
    })();

  }, [threadId, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const newThread = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("ai_threads")
      .insert({ user_id: user.id })
      .select("id, title, updated_at, listing_id")
      .single();
    if (error || !data) {
      toast.error("تعذّر إنشاء محادثة");
      return;
    }
    setThreads((prev) => [data as Thread, ...prev]);
    navigate(`/ai/${(data as Thread).id}`);
  };

  const deleteThread = async (id: string) => {
    const { error } = await supabase.from("ai_threads").delete().eq("id", id);
    if (error) {
      toast.error("تعذّر حذف المحادثة");
      return;
    }
    const rest = threads.filter((t) => t.id !== id);
    setThreads(rest);
    if (threadId === id) {
      if (rest.length > 0) navigate(`/ai/${rest[0].id}`, { replace: true });
      else navigate("/ai", { replace: true });
    }
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || !threadId || sending) return;
    setInput("");
    setSending(true);
    setStreaming("");
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", content }]);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("يجب تسجيل الدخول");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ threadId, message: content }),
        },
      );

      if (!res.ok || !res.body) {
        let message = "تعذّر الحصول على رد من المساعد";
        try {
          const json = await res.json();
          if (json?.error) message = json.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }

      setMessages((prev) => [
        ...prev,
        { id: `local-a-${Date.now()}`, role: "assistant", content: acc },
      ]);
      setStreaming("");
      loadThreads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="container mx-auto px-3 py-4 pb-24">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">مساعد سوق الكل الذكي</h1>
        </div>

        <div className="grid md:grid-cols-[260px_1fr] gap-4">
          {/* Threads */}
          <aside className="space-y-2">
            <Button onClick={newThread} className="w-full" size="sm">
              <Plus className="h-4 w-4 me-1" />
              محادثة جديدة
            </Button>
            <div className="rounded-lg border border-border divide-y divide-border max-h-[240px] md:max-h-[60vh] overflow-y-auto">
              {threads.length === 0 && (
                <p className="p-3 text-xs text-muted-foreground">لا توجد محادثات بعد</p>
              )}
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "flex items-center gap-1 px-2 py-2",
                    threadId === t.id && "bg-primary/10",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/ai/${t.id}`)}
                    className="flex-1 text-start text-xs truncate flex items-center gap-1.5"
                  >
                    <MessagesSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{t.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(t.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                    aria-label="حذف المحادثة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </aside>

          {/* Conversation */}
          <section className="flex flex-col rounded-lg border border-border h-[65vh]">
            <ScrollArea className="flex-1">
              <div ref={scrollRef} className="p-3 space-y-4 overflow-y-auto max-h-[calc(65vh-110px)]">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 && !streaming ? (
                  <div className="py-6 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      اسألني عن الأسعار، أو دعني أكتب لك إعلاناً مميزاً.
                    </p>
                    <div className="flex flex-col gap-2 items-center">
                      {SUGGESTIONS.map((s) => (
                        <Button
                          key={s}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-2 whitespace-normal"
                          onClick={() => send(s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) =>
                    m.role === "user" ? (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-3 py-2 text-sm whitespace-pre-wrap">
                          {m.content}
                        </div>
                      </div>
                    ) : (
                      <div key={m.id} className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ),
                  )
                )}

                {streaming && (
                  <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{streaming}</ReactMarkdown>
                  </div>
                )}
                {sending && !streaming && (
                  <p className="text-sm text-muted-foreground animate-pulse">يكتب...</p>
                )}
              </div>
            </ScrollArea>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border p-2 flex items-end gap-2"
            >
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="اكتب سؤالك..."
                rows={2}
                className="resize-none text-sm"
                disabled={sending || !threadId}
              />
              <Button type="submit" size="icon" disabled={sending || !input.trim() || !threadId}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </section>
        </div>
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المحادثة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف جميع رسائل هذه المحادثة نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteThread(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>

      </AlertDialog>

      <BottomNavigation />
    </div>
  );
};

export default AiAssistant;
