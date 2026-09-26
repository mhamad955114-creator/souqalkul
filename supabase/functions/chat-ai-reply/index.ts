// AI helper reply inside a buyer–seller conversation. Visible to both parties.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MODEL = "openai/gpt-6-astra";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI غير مُهيّأ" }, 500);
    const authHeader = req.headers.get("Authorization") || "";
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u } = await userClient.auth.getUser();
    const user = u?.user;
    if (!user) return json({ error: "يجب تسجيل الدخول" }, 401);

    const body = await req.json().catch(() => ({}));
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return json({ error: "طلب غير صالح" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: conv } = await admin.from("conversations").select("*").eq("id", conversationId).maybeSingle();
    if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) return json({ error: "المحادثة غير موجودة" }, 404);

    const [{ data: listing }, { data: msgs }] = await Promise.all([
      admin.from("listings").select("title, description, price, currency, city, area, category, status, metadata").eq("id", conv.listing_id).maybeSingle(),
      admin.from("messages").select("sender_id, content, is_ai").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(20),
    ]);

    const transcript = (msgs || []).reverse().map((m) => {
      const who = m.is_ai ? "المساعد" : m.sender_id === conv.seller_id ? "البائع" : "المشتري";
      return `${who}: ${m.content}`;
    }).join("\n");

    const system = `أنت مساعد ذكي محايد داخل محادثة بين بائع ومشتري في تطبيق "سوق الكل". ردّك يراه الطرفان.
أجب بالعربية باختصار (3-5 جمل)، اعتمد فقط على بيانات الإعلان والمحادثة، لا تختلق معلومات، لا تطلب أي دفع إلكتروني، ونبّه للسلامة عند الحاجة (المعاينة قبل الدفع، اللقاء في مكان عام). استخدم الأرقام الإنجليزية.
بيانات الإعلان: ${JSON.stringify(listing || {})}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: system,
        input: [{ role: "user", content: `المحادثة حتى الآن:\n${transcript}\n\nاكتب رد المساعد المفيد للطرفين على آخر رسالة.` }],
      }),
    });
    if (!r.ok || !r.body) {
      const t = await r.text().catch(() => "");
      console.error("gateway", r.status, t.slice(0, 500));
      if (r.status === 429) return json({ error: "ضغط كبير، حاول بعد قليل" }, 429);
      if (r.status === 402) return json({ error: "نفد رصيد الذكاء الاصطناعي" }, 402);
      return json({ error: "تعذّر توليد الرد" }, r.status >= 400 && r.status < 600 ? r.status : 500);
    }

    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const d = line.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") text += ev.delta;
        } catch { /* partial */ }
      }
    }
    text = text.trim();
    if (!text) return json({ error: "لم يصدر رد من المساعد" }, 502);

    const { data: saved, error } = await admin.from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content: text.slice(0, 4000), is_ai: true })
      .select().single();
    if (error) { console.error(error); return json({ error: "تعذّر حفظ الرد" }, 500); }
    await admin.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    return json({ message: saved });
  } catch (e) {
    console.error(e);
    return json({ error: "خطأ غير متوقع" }, 500);
  }
});
