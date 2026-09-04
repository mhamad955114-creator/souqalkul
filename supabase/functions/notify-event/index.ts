// Central notification dispatcher: writes in-app notifications (which also
// trigger push) for admins and/or a specific user. Uses the service role so
// non-admin users can trigger admin alerts without an open RLS insert policy.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  title?: string;
  message?: string;
  type?: string;
  relatedId?: string | null;
  targetUserId?: string | null;
  notifyAdmins?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate the caller's JWT in code (verify_jwt is disabled by default).
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const caller = userData?.user;
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Payload;
    const title = (body.title || "").toString().trim().slice(0, 160);
    const message = (body.message || "").toString().trim().slice(0, 600);
    const type = (body.type || "").toString().trim().slice(0, 60);
    if (!title || !message || !type) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(url, serviceKey);

    const { data: isAdminData } = await admin.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    const callerIsAdmin = isAdminData === true;

    const recipients = new Set<string>();

    if (body.notifyAdmins !== false) {
      const { data: admins } = await admin.from("user_roles").select("user_id").eq("role", "admin");
      (admins || []).forEach((r: { user_id: string }) => recipients.add(r.user_id));
    }

    // A normal user may only target themselves; admins may target anyone.
    if (body.targetUserId) {
      if (callerIsAdmin || body.targetUserId === caller.id) {
        recipients.add(body.targetUserId);
      }
    }

    if (recipients.size === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = [...recipients].map((userId) => ({
      user_id: userId,
      title,
      message,
      type,
      related_id: body.relatedId || null,
    }));

    const { error } = await admin.from("notifications").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ sent: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-event error", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
