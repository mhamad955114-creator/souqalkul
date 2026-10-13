const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.700.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const B2_KEY_ID = Deno.env.get("B2_KEY_ID")!;
const B2_APP_KEY = Deno.env.get("B2_APP_KEY")!;
const B2_ENDPOINT_RAW = Deno.env.get("B2_ENDPOINT")!;
const B2_ENDPOINT = B2_ENDPOINT_RAW.startsWith("http") ? B2_ENDPOINT_RAW : `https://${B2_ENDPOINT_RAW}`;
const B2_BUCKET_NAME = Deno.env.get("B2_BUCKET_NAME")!;
// Optional: dedicated public/friendly URL for downloads. Falls back to deriving from S3 endpoint.
const B2_PUBLIC_URL = Deno.env.get("B2_PUBLIC_URL") || "";

/**
 * Derive the B2 friendly download URL from the S3 endpoint.
 * S3 endpoint: https://s3.us-west-004.backblazeb2.com
 * Friendly URL: https://f004.backblazeb2.com/file/bucket/key
 */
function buildPublicUrl(key: string): string {
  if (B2_PUBLIC_URL) {
    return `${B2_PUBLIC_URL.replace(/\/$/, "")}/file/${B2_BUCKET_NAME}/${key}`;
  }
  // Try to derive friendly URL from S3 endpoint
  const match = B2_ENDPOINT.match(/s3\.([a-z]+-[a-z]+-\d+)\.backblazeb2\.com/);
  if (match) {
    const region = match[1]; // e.g. "us-west-004"
    const regionCode = region.split("-").pop(); // e.g. "004"
    return `https://f${regionCode}.backblazeb2.com/file/${B2_BUCKET_NAME}/${key}`;
  }
  // Fallback: use endpoint directly
  return `${B2_ENDPOINT.replace(/\/$/, "")}/file/${B2_BUCKET_NAME}/${key}`;
}

const s3 = new S3Client({
  endpoint: B2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APP_KEY,
  },
  forcePathStyle: true,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    const userId = (claimsData?.claims as { sub?: string } | undefined)?.sub;
    if (claimsError || !claimsData?.claims || !userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 100MB max
    if (file.size > 100 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large (max 100MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Destination folder is derived server-side: the caller can only pick a
    // root namespace, never another user's folder.
    const root = requestedFolder
      .replace(/^\/+|\/+$/g, "")
      .split("/")[0]
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .toLowerCase() || "uploads";

    const ALLOWED_ROOTS = ["listings", "avatars", "uploads", "receipts"];
    const ADMIN_ONLY_ROOTS = ["brand"];

    let folder: string;
    if (ADMIN_ONLY_ROOTS.includes(root)) {
      if (isAdmin !== true) {
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      folder = root;
    } else if (ALLOWED_ROOTS.includes(root)) {
      folder = `${root}/${userId}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid destination folder" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const key = `${folder}/${uniqueName}`;

    const arrayBuffer = await file.arrayBuffer();

    console.log("Uploading to B2:", { bucket: B2_BUCKET_NAME, key, contentType: file.type, size: file.size });

    await s3.send(
      new PutObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type || "application/octet-stream",
      })
    );

    // Build public download URL
    const publicUrl = buildPublicUrl(key);
    console.log("Upload success, public URL:", publicUrl);

    return new Response(
      JSON.stringify({ url: publicUrl, key }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("B2 upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Upload failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
