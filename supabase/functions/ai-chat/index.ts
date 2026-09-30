// AI assistant chat for Souq Alkul — streams answers and saves history.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-3.6-flash";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI غير مُهيّأ" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "يجب تسجيل الدخول" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "يجب تسجيل الدخول" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const threadId: string | undefined = body.threadId;
    const userMessage: string = (body.message || "").toString().slice(0, 4000);
    const listingContext: string | undefined = body.listingContext;
    // Listing photos (https URLs) forwarded so the model can analyse them.
    const listingImages: string[] = Array.isArray(body.listingImages)
      ? body.listingImages
          .filter((u: unknown) => typeof u === "string" && /^https?:\/\//i.test(u))
          .filter((u: string) => !/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(u))
          .slice(0, 4)
      : [];

    if (!threadId || !userMessage.trim()) {
      return new Response(JSON.stringify({ error: "طلب غير صالح" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify thread ownership
    const { data: thread, error: threadError } = await supabase
      .from("ai_threads")
      .select("id, user_id, title")
      .eq("id", threadId)
      .maybeSingle();

    if (threadError || !thread || thread.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "المحادثة غير موجودة" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load prior turns (the model is stateless — send the whole conversation)
    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(40);

    await supabase.from("ai_messages").insert({
      thread_id: threadId,
      user_id: user.id,
      role: "user",
      content: userMessage,
    });

    const systemPrompt = [
      "أنت \"مساعد سوق الكل\"، مساعد ذكي داخل تطبيق إعلانات مبوبة عربي.",
      "أجب دائماً بنفس لغة المستخدم (العربية افتراضياً) وبأسلوب مختصر وودّي.",
      "تساعد المستخدمين في: كتابة إعلانات جذابة، تقييم الأسعار وتقدير القيمة العادلة، نصائح البيع والشراء الآمن، ومقارنة المنتجات.",
      "استخدم الأرقام الإنجليزية (123) دائماً.",
      "لا تطلب أبداً معلومات بطاقات بنكية أو كلمات مرور، ولا تعد بأي دفع إلكتروني داخل التطبيق — الترقيات تتم يدوياً عبر واتساب.",
      "إن كان السؤال خارج نطاق السوق والبيع والشراء، أجب بلطف وباختصار.",
      listingContext ? `سياق الإعلان الحالي:\n${listingContext}` : "",
      listingImages.length
        ? `صور الإعلان مرفقة مع رسالة المستخدم (${listingImages.length}). اعتمد عليها في وصف الحالة والتفاصيل الظاهرة، ولا تخترع تفاصيل غير مرئية.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Attach the listing photos to the current user turn (multimodal blocks).
    const currentUserContent = listingImages.length
      ? [
          { type: "text", text: userMessage },
          ...listingImages.map((url) => ({ type: "image_url", image_url: { url } })),
        ]
      : userMessage;

    const messages = [
      { role: "system", content: systemPrompt },
      ...((history || []) as ChatMessage[]).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: currentUserContent },
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({ model: MODEL, messages, stream: true }),
    });

    if (!aiRes.ok || !aiRes.body) {
      const text = await aiRes.text();
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 500;
      const message =
        status === 429
          ? "تم تجاوز حد الاستخدام، حاول بعد قليل"
          : status === 402
          ? "انتهى رصيد الذكاء الاصطناعي"
          : "تعذّر الحصول على رد من المساعد";
      console.error("AI gateway error", aiRes.status, text);
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream plain text deltas to the client while accumulating for persistence.
    let full = "";
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload);
                const delta = json?.choices?.[0]?.delta?.content;
                if (delta) {
                  full += delta;
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                // partial JSON, ignore
              }
            }
          }
        } catch (err) {
          console.error("stream error", err);
        } finally {
          controller.close();
          if (full.trim()) {
            const { error: saveError } = await supabase.from("ai_messages").insert({
              thread_id: threadId,
              user_id: user.id,
              role: "assistant",
              content: full,
            });
            if (saveError) console.error("save assistant message failed", saveError);

            const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
            if (!thread.title || thread.title === "محادثة جديدة") {
              updates.title = userMessage.slice(0, 60);
            }
            await supabase.from("ai_threads").update(updates).eq("id", threadId);

          }

        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("ai-chat error", err);
    return new Response(JSON.stringify({ error: "خطأ غير متوقع" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
