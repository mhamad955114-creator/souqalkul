import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Backblaze B2 via the upload-to-b2 edge function.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToB2(
  file: File | Blob,
  folder: string = "uploads",
  fileName?: string
): Promise<string> {
  const formData = new FormData();
  
  // If it's a Blob without a name, wrap it in a File
  if (file instanceof Blob && !(file instanceof File)) {
    const name = fileName || `file-${Date.now()}.webp`;
    file = new File([file], name, { type: file.type });
  }
  
  formData.append("file", file);
  formData.append("folder", folder);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/upload-to-b2`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("B2 upload failed:", response.status, errText);
    let err = { error: "Upload failed" };
    try { err = JSON.parse(errText); } catch {}
    throw new Error(err.error || "Upload failed");
  }

  const result = await response.json();
  return result.url;
}
