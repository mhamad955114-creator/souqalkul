import { supabase } from "@/integrations/supabase/client";

/**
 * Delete files from Backblaze B2 via the delete-from-b2 edge function.
 * Accepts a single URL/key or arrays.
 */
export async function deleteFromB2(
  options: { url?: string; urls?: string[]; key?: string; keys?: string[] }
): Promise<{ deleted: number }> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/delete-from-b2`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(options),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Delete failed" }));
    throw new Error(err.error || "Delete failed");
  }

  return response.json();
}
