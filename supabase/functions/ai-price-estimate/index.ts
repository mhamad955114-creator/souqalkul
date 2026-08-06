// AI price evaluation for a listing (works for both a saved listing and a draft).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-3.6-flash";

interface Draft {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  city?: string;
  country?: string;
  metadata?: Record<string, unknown> | null;
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined,
    );

    const body = await req.json();
    let draft: Draft = body.listing || {};

    if (body.listingId) {
      const { data, error } = await supabase
        .from("listings")
        .select("title, description, price, currency, category, city, country, metadata")
        .eq("id", body.listingId)
        .maybeSingle();
      if (error || !data) {
        return new Response(JSON.stringify({ error: "الإعلان غير موجود" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      draft = data as Draft;
    }

    if (!draft.title || !draft.category) {
      return new Response(JSON.stringify({ error: "بيانات الإعلان غير مكتملة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Comparable listings in the same category/country give the model real market anchors.
    let comparables: Array<Record<string, unknown>> = [];
    const { data: sameCity } = await supabase
      .from("listings")
      .select("title, price, currency, city, created_at, metadata")
      .eq("category", draft.category)
      .eq("status", "active")
      .eq("country", draft.country || "سوريا")
      .order("created_at", { ascending: false })
      .limit(25);
    comparables = sameCity || [];

    const comparablesText = comparables.length
      ? comparables
          .map(
            (c) =>
              `- ${c.title} | ${c.price} ${c.currency} | ${c.city}${
                c.metadata ? ` | ${JSON.stringify(c.metadata).slice(0, 200)}` : ""
              }`,
          )
          .join("\n")
      : "لا توجد إعلانات مشابهة في قاعدة البيانات.";

    const prompt = `قيّم سعر هذا الإعلان في السوق المحلي.

الإعلان:
- العنوان: ${draft.title}
- الوصف: ${(draft.description || "").toString().slice(0, 800)}
- التصنيف: ${draft.category}
- المدينة: ${draft.city || "غير محددة"} (${draft.country || "غير محددة"})
- السعر المطلوب: ${draft.price ?? "غير محدد"} ${draft.currency || ""}
- مواصفات إضافية: ${draft.metadata ? JSON.stringify(draft.metadata).slice(0, 800) : "لا يوجد"}

إعلانات مشابهة في نفس التصنيف والبلد:
${comparablesText}

أعد النتيجة بصيغة JSON فقط بهذا الشكل بدون أي نص إضافي:
{"fair_min": number, "fair_max": number, "currency": string, "verdict": "منخفض"|"مناسب"|"مرتفع"|"غير محدد", "confidence": "منخفضة"|"متوسطة"|"عالية", "summary": string, "reasons": string[], "tips": string[]}
استخدم الأرقام الإنجليزية، واجعل summary سطراً واحداً بالعربية، وreasons وtips من 2 إلى 4 عناصر قصيرة.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "أنت خبير تسعير في سوق إعلانات مبوبة عربي. تعتمد على الإعلانات المشابهة المعطاة والمعرفة العامة بالأسعار. أجب بـ JSON صالح فقط.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("AI gateway error", aiRes.status, text);
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 500;
      const message =
        status === 429
          ? "تم تجاوز حد الاستخدام، حاول بعد قليل"
          : status === 402
          ? "انتهى رصيد الذكاء الاصطناعي"
          : "تعذّر تقييم السعر حالياً";
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw: string = aiJson?.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("unparseable AI output", raw.slice(0, 500));
      return new Response(JSON.stringify({ error: "تعذّر تحليل نتيجة التقييم" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return new Response(JSON.stringify({ error: "تعذّر تحليل نتيجة التقييم" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        currency: parsed.currency || draft.currency || "",
        comparables_count: comparables.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("ai-price-estimate error", err);
    return new Response(JSON.stringify({ error: "خطأ غير متوقع" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
