const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.700.0";

const B2_KEY_ID = Deno.env.get("B2_KEY_ID")!;
const B2_APP_KEY = Deno.env.get("B2_APP_KEY")!;
const B2_ENDPOINT = Deno.env.get("B2_ENDPOINT")!;
const B2_BUCKET_NAME = Deno.env.get("B2_BUCKET_NAME")!;

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
