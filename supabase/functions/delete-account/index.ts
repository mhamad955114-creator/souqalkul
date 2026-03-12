import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS configuration - restrict to authorized domains only
const getAllowedOrigins = () => {
  const environment = Deno.env.get("ENVIRONMENT") || "production";
  const allowedOrigins: Record<string, string[]> = {
    production: ["https://yourdomain.com", "https://www.yourdomain.com"],
    staging: ["https://staging.yourdomain.com", "http://localhost:8080"],
    development: ["http://localhost:8080", "http://localhost:5173"],
  };
  return allowedOrigins[environment] || allowedOrigins["production"];
};

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = origin && allowedOrigins.includes(origin);
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
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

    // Verify the user with their token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to delete the user
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Delete user data from public tables
    await adminClient.from("notifications").delete().eq("user_id", user.id);
    await adminClient.from("favorites").delete().eq("user_id", user.id);
    await adminClient.from("push_subscriptions").delete().eq("user_id", user.id);
    await adminClient.from("notification_preferences").delete().eq("user_id", user.id);
    await adminClient.from("profiles").delete().eq("user_id", user.id);
    await adminClient.from("wallets").delete().eq("user_id", user.id);

    // Sign out from all devices before deleting
    await adminClient.auth.admin.signOut(user.id, "global");

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("Delete user error:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
