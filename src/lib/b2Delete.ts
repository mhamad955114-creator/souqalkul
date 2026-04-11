import { supabase } from "@/integrations/supabase/client";

const EDGE_DELETE_TIMEOUT_MS = 10000;
const STORAGE_BUCKET = "listings";

type DeleteOptions = { url?: string; urls?: string[]; key?: string; keys?: string[] };

function extractSupabaseStoragePath(url: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.slice(index + marker.length));
  } catch {
    return null;
  }
}

function hasB2Targets(options: DeleteOptions): boolean {
  return Boolean(options.key || options.keys?.length || options.url || options.urls?.length);
}

/**
 * Delete files from Backblaze B2 when needed, with support for Lovable Cloud storage URLs.
 */
export async function deleteFromB2(options: DeleteOptions): Promise<{ deleted: number }> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const storagePaths = new Set<string>();
  const b2Payload: DeleteOptions = {};

  const addB2Url = (url: string) => {
    if (!b2Payload.urls) b2Payload.urls = [];
    b2Payload.urls.push(url);
  };

  const addB2Key = (key: string) => {
    if (!b2Payload.keys) b2Payload.keys = [];
    b2Payload.keys.push(key);
  };

  const handleUrl = (url: string) => {
    const storagePath = extractSupabaseStoragePath(url);
    if (storagePath) {
      storagePaths.add(storagePath);
      return;
    }
    addB2Url(url);
  };

  if (options.url) handleUrl(options.url);
  options.urls?.forEach(handleUrl);
  if (options.key) addB2Key(options.key);
  options.keys?.forEach(addB2Key);

  let deleted = 0;

  if (storagePaths.size > 0) {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([...storagePaths]);
    if (error) {
      throw new Error(error.message || "Delete failed");
    }
    deleted += storagePaths.size;
  }

  let b2Error: Error | null = null;

  if (hasB2Targets(b2Payload)) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), EDGE_DELETE_TIMEOUT_MS);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/delete-from-b2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(b2Payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        let err: { error?: string } = { error: "Delete failed" };
        try {
          err = JSON.parse(errText);
        } catch {
          err = { error: errText || "Delete failed" };
        }
        throw new Error(err.error || "Delete failed");
      }

      const result = await response.json().catch(() => ({ deleted: 0 }));
      deleted += result.deleted ?? 0;
    } catch (error) {
      b2Error = error instanceof Error ? error : new Error("Delete failed");
      console.warn("B2 delete failed:", b2Error);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  if (deleted === 0 && b2Error) {
    throw b2Error;
  }

  return { deleted };
}
