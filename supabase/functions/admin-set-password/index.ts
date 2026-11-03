import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const userId = body?.user_id;
    const password = body?.password;
    if (typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) return json({ error: "Invalid user_id" }, 400);
    if (typeof password !== "string" || password.length < 6 || password.length > 72)
      return json({ error: "Password must be 6-72 characters" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: targetIsAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (targetIsAdmin && userId !== caller.id) return json({ error: "Cannot change another admin's password" }, 403);

    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return json({ error: error.message }, 400);
    try { await admin.auth.admin.signOut(userId, "global"); } catch { /* ignore */ }
    console.log(`Admin ${caller.id} reset password for ${userId}`);
    return json({ success: true });
  } catch (e) {
    console.error(e);
    return json({ error: "Internal server error" }, 500);
  }
});
