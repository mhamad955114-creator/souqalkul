import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Verify the calling user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: callerError } = await userClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Verify the caller is an admin (server-side via has_role RPC)
    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      console.warn(`Unauthorized admin-delete-user attempt by ${caller.id}`);
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Parse body
    let body: { user_id?: string; reason?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetUserId = body.user_id;
    const reason = (body.reason || "").toString().slice(0, 500);

    if (!targetUserId || typeof targetUserId !== "string" || !/^[0-9a-f-]{36}$/i.test(targetUserId)) {
      return new Response(JSON.stringify({ error: "Invalid user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Prevent self-deletion via this admin endpoint
    if (targetUserId === caller.id) {
      return new Response(JSON.stringify({ error: "Cannot delete your own account from admin panel. Use account settings." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 5. Prevent deleting other admins (extra safety)
    const { data: targetIsAdmin } = await adminClient.rpc("has_role", {
      _user_id: targetUserId,
      _role: "admin",
    });
    if (targetIsAdmin) {
      return new Response(JSON.stringify({ error: "Cannot delete another admin account" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Clean up related data
    await adminClient.from("listings").delete().eq("user_id", targetUserId);
    await adminClient.from("notifications").delete().eq("user_id", targetUserId);
    await adminClient.from("favorites").delete().eq("user_id", targetUserId);
    await adminClient.from("push_subscriptions").delete().eq("user_id", targetUserId);
    await adminClient.from("notification_preferences").delete().eq("user_id", targetUserId);
    await adminClient.from("ratings").delete().eq("seller_id", targetUserId);
    await adminClient.from("ratings").delete().eq("reviewer_id", targetUserId);
    await adminClient.from("reports").delete().eq("reporter_id", targetUserId);
    await adminClient.from("user_roles").delete().eq("user_id", targetUserId);
    await adminClient.from("profiles").delete().eq("user_id", targetUserId);
    await adminClient.from("wallets").delete().eq("user_id", targetUserId);

    // 7. Sign out & delete the auth user
    try { await adminClient.auth.admin.signOut(targetUserId, "global"); } catch { /* ignore */ }
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

    const alreadyGone = deleteError && ((deleteError as any).status === 404 || (deleteError as any).code === "user_not_found");
    if (deleteError && !alreadyGone) {
      console.error("Delete user error:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Admin ${caller.id} deleted user ${targetUserId}. Reason: ${reason || "(none)"}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
