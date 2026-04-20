import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller is admin
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, target_user_id, reason, expires_at } = body;

    if (!target_user_id || !action) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (target_user_id === user.id) {
      return new Response(JSON.stringify({ error: "Cannot suspend yourself" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Don't allow suspending other admins
    const { data: targetIsAdmin } = await adminClient.rpc("has_role", {
      _user_id: target_user_id,
      _role: "admin",
    });

    if (targetIsAdmin) {
      return new Response(JSON.stringify({ error: "Cannot suspend an admin" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "suspend") {
      // Insert/update ban record
      const { error: banError } = await adminClient
        .from("banned_users")
        .upsert({
          user_id: target_user_id,
          reason: reason || null,
          banned_by: user.id,
          banned_at: new Date().toISOString(),
          expires_at: expires_at || null,
        }, { onConflict: "user_id" });

      if (banError) throw banError;

      // Sign out the user from all sessions immediately
      await adminClient.auth.admin.signOut(target_user_id, "global");

      // Notify the user
      await adminClient.from("notifications").insert({
        user_id: target_user_id,
        title: "تم تعليق حسابك",
        message: reason ? `تم تعليق حسابك. السبب: ${reason}` : "تم تعليق حسابك من قبل الإدارة",
        type: "account_suspended",
      });

      return new Response(JSON.stringify({ success: true, action: "suspended" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unsuspend") {
      const { error: unbanError } = await adminClient
        .from("banned_users")
        .delete()
        .eq("user_id", target_user_id);

      if (unbanError) throw unbanError;

      await adminClient.from("notifications").insert({
        user_id: target_user_id,
        title: "تم إلغاء تعليق حسابك",
        message: "تم إلغاء تعليق حسابك. يمكنك الآن استخدام الحساب مجدداً",
        type: "account_unsuspended",
      });

      return new Response(JSON.stringify({ success: true, action: "unsuspended" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
