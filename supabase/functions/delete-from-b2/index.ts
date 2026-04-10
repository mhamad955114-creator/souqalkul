const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from "npm:@aws-sdk/client-s3@3.700.0";

const B2_KEY_ID = Deno.env.get("B2_KEY_ID")!;
const B2_APP_KEY = Deno.env.get("B2_APP_KEY")!;
const B2_ENDPOINT_RAW = Deno.env.get("B2_ENDPOINT")!;
const B2_ENDPOINT = B2_ENDPOINT_RAW.startsWith("http") ? B2_ENDPOINT_RAW : `https://${B2_ENDPOINT_RAW}`;
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

/**
 * Extract the B2 object key from a full public URL.
 * URL format: https://endpoint/file/bucket/folder/filename.ext
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    const bucketPrefix = `/file/${B2_BUCKET_NAME}/`;
    const idx = url.indexOf(bucketPrefix);
    if (idx !== -1) {
      return url.substring(idx + bucketPrefix.length);
    }
    // Fallback: try to get everything after the bucket name
    const parts = new URL(url);
    const pathParts = parts.pathname.split(`/${B2_BUCKET_NAME}/`);
    if (pathParts.length > 1) {
      return pathParts[1];
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Support single key, single URL, or arrays
    const { key, keys, url, urls } = body as {
      key?: string;
      keys?: string[];
      url?: string;
      urls?: string[];
    };

    // Collect all keys to delete
    const keysToDelete: string[] = [];

    if (key) keysToDelete.push(key);
    if (keys) keysToDelete.push(...keys);
    if (url) {
      const k = extractKeyFromUrl(url);
      if (k) keysToDelete.push(k);
    }
    if (urls) {
      for (const u of urls) {
        const k = extractKeyFromUrl(u);
        if (k) keysToDelete.push(k);
      }
    }

    if (keysToDelete.length === 0) {
      return new Response(
        JSON.stringify({ error: "No keys or URLs provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use batch delete if multiple, single delete otherwise
    if (keysToDelete.length === 1) {
      await s3.send(new DeleteObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: keysToDelete[0],
      }));
    } else {
      // DeleteObjects supports up to 1000 keys per call
      const batches: string[][] = [];
      for (let i = 0; i < keysToDelete.length; i += 1000) {
        batches.push(keysToDelete.slice(i, i + 1000));
      }
      for (const batch of batches) {
        await s3.send(new DeleteObjectsCommand({
          Bucket: B2_BUCKET_NAME,
          Delete: {
            Objects: batch.map(k => ({ Key: k })),
            Quiet: true,
          },
        }));
      }
    }

    return new Response(
      JSON.stringify({ deleted: keysToDelete.length, keys: keysToDelete }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("B2 delete error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Delete failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
