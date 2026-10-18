import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { jwtVerify, importX509, type JWTPayload } from "https://esm.sh/jose@5.9.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIREBASE_PROJECT_ID = "souk-alkul";
const CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let certsCache: { fetchedAt: number; certs: Record<string, string> } | null = null;

async function getCerts(): Promise<Record<string, string>> {
  if (certsCache && Date.now() - certsCache.fetchedAt < 60 * 60 * 1000) {
    return certsCache.certs;
  }
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error("failed_to_fetch_firebase_certs");
  const certs = (await res.json()) as Record<string, string>;
  certsCache = { fetchedAt: Date.now(), certs };
  return certs;
}

async function verifyFirebaseIdToken(idToken: string): Promise<JWTPayload> {
  const [headerPart] = idToken.split(".");
  if (!headerPart) throw new Error("invalid_token");
  const header = JSON.parse(atob(headerPart.replace(/-/g, "+").replace(/_/g, "/")));
  const certs = await getCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error("unknown_key_id");
  const key = await importX509(cert, "RS256");
  const { payload } = await jwtVerify(idToken, key, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
    algorithms: ["RS256"],
  });
  if (!payload.sub) throw new Error("missing_subject");
  return payload;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return new Response(JSON.stringify({ error: "missing_id_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await verifyFirebaseIdToken(idToken);
    const firebaseUid = String(payload.sub);
    const phoneRaw = (payload.phone_number as string | undefined) ?? "";
    const phone = phoneRaw.startsWith("+") ? phoneRaw : `+${digitsOnly(phoneRaw)}`;
    const digits = digitsOnly(phone);

    if (digits.length < 8) {
      return new Response(JSON.stringify({ error: "missing_phone_number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const syntheticEmail = `p${digits}@phone.souqalkul.app`;
    let userId: string | null = null;
    let userEmail: string | null = null;

    // 1) Try to match an existing profile by phone number (last 9 digits).
    const tail = digits.slice(-9);
    const { data: profileMatches } = await admin
      .from("profiles")
      .select("user_id, phone")
      .not("phone", "is", null)
      .ilike("phone", `%${tail}`)
      .limit(5);

    const matched = (profileMatches ?? []).find(
      (p: { phone: string | null }) => digitsOnly(p.phone ?? "").endsWith(tail),
    );
    if (matched) userId = matched.user_id as string;

    // 2) Otherwise look for a previously created phone-only account.
    if (!userId) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list?.users?.find(
        (u) =>
          u.email === syntheticEmail ||
          (u.user_metadata as Record<string, unknown> | null)?.firebase_uid === firebaseUid,
      );
      if (existing) {
        userId = existing.id;
        userEmail = existing.email ?? null;
      }
    }

    // 3) Create a fresh account when nothing matched.
    if (!userId) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        user_metadata: { firebase_uid: firebaseUid, phone, full_name: phone },
      });
      if (createError || !created?.user) {
        console.error("create_user_failed", createError);
        return new Response(JSON.stringify({ error: "create_user_failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = created.user.id;
      userEmail = created.user.email ?? syntheticEmail;
    }

    if (!userEmail) {
      const { data: fetched } = await admin.auth.admin.getUserById(userId);
      userEmail = fetched?.user?.email ?? null;
    }
    if (!userEmail) {
      return new Response(JSON.stringify({ error: "account_without_email" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Keep the Firebase uid and the verified phone number on the account.
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { firebase_uid: firebaseUid, phone },
    });

    // Persist the profile row (upsert on user_id).
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProfile) {
      await admin.from("profiles").update({ phone }).eq("user_id", userId);
    } else {
      await admin.from("profiles").insert({ user_id: userId, phone, full_name: phone });
    }

    // Mint a one-time token the client exchanges for a real session.
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
    });
    if (linkError || !link?.properties?.hashed_token) {
      console.error("generate_link_failed", linkError);
      return new Response(JSON.stringify({ error: "session_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        email: userEmail,
        token_hash: link.properties.hashed_token,
        user_id: userId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("phone_auth_error", error);
    return new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
