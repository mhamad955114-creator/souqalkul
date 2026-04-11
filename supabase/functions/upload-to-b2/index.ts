const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.700.0";

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
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 50MB max
    if (file.size > 50 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large (max 50MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const key = `${folder}/${uniqueName}`;

    const arrayBuffer = await file.arrayBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type || "application/octet-stream",
      })
    );

    // Build public URL - strip protocol from endpoint for path-style URL
    const endpointClean = B2_ENDPOINT.replace(/\/$/, "");
    const publicUrl = `${endpointClean}/file/${B2_BUCKET_NAME}/${key}`;

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
