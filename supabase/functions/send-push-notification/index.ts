// Sends real (encrypted, VAPID-signed) Web Push messages for a stored notification.
// Called by the notifications insert trigger with only the notification id; the
// function loads the row itself, so callers cannot inject arbitrary content.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const routeFor = (type: string, relatedId: string | null) => {
  if (type === "new_message") return relatedId ? `/messages?listing=${relatedId}` : "/messages";
  if (type === "admin" || type === "plan_request" || type === "upgrade_request")
    return relatedId ? `/admin/reports?tab=upgrades&request=${relatedId}` : "/admin/reports?tab=upgrades";
  if (type.startsWith("reward")) return "/rewards";
  if (type.startsWith("subscription")) return "/my-account";
  return relatedId ? `/listing/${relatedId}` : "/";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const pub = Deno.env.get("VAPID_PUBLIC_KEY");
    const priv = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!pub || !priv) return json({ error: "VAPID keys not configured" }, 500);
    webpush.setVapidDetails("mailto:support@souqalkul.app", pub, priv);

    const { notification_id } = await req.json().catch(() => ({}));
    if (typeof notification_id !== "string" || !/^[0-9a-f-]{36}$/i.test(notification_id))
      return json({ error: "Invalid notification_id" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: n } = await supabase
      .from("notifications")
      .select("id,user_id,title,message,type,related_id,created_at")
      .eq("id", notification_id)
      .maybeSingle();
    if (!n) return json({ error: "Not found" }, 404);
    if (Date.now() - new Date(n.created_at).getTime() > 10 * 60 * 1000) return json({ skipped: "old" });

    const { data: subs } = await supabase.from("push_subscriptions").select("*").eq("user_id", n.user_id);
    if (!subs?.length) return json({ sent: 0 });

    const payload = JSON.stringify({
      title: n.title,
      body: n.message,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      data: { type: n.type, related_id: n.related_id, url: routeFor(n.type, n.related_id) },
    });

    let sent = 0;
    const expired: string[] = [];
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 86400, urgency: "high" },
        );
        sent++;
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) expired.push(s.endpoint);
        else console.error("push failed", e?.statusCode, e?.body);
      }
    }
    if (expired.length) await supabase.from("push_subscriptions").delete().in("endpoint", expired);
    return json({ sent, cleaned: expired.length });
  } catch (e) {
    console.error("send-push-notification error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
