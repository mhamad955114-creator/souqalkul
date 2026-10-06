import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin role required" }, 403);

    const out: Record<string, unknown>[] = [];
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      for (const u of data.users) {
        const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
        const email = u.email ?? null;
        const synthetic = !!email && email.endsWith("@phone.souqalkul.app");
        const providers = Array.from(new Set((u.identities ?? []).map((i) => i.provider)));
        let method = "email";
        if (synthetic || meta.firebase_uid || (!email && u.phone)) method = "phone";
        else if (providers.includes("google") && !providers.includes("email")) method = "google";
        out.push({
          user_id: u.id,
          method,
          providers,
          email: synthetic ? null : email,
          phone: u.phone ? `+${String(u.phone).replace(/^\+/, "")}` : (meta.phone as string) ?? null,
          email_confirmed_at: u.email_confirmed_at ?? null,
          phone_confirmed_at: u.phone_confirmed_at ?? null,
          signed_up_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
        });
      }
      if (data.users.length < 1000) break;
    }
    return json({ users: out });
  } catch (e) {
    console.error(e);
    return json({ error: "failed" }, 500);
  }
});
