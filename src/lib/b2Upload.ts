import { supabase } from "@/integrations/supabase/client";

const EDGE_UPLOAD_TIMEOUT_MS = 15000;
const STORAGE_BUCKET = "listings";

function normalizeFolder(folder: string): string {
  return folder
    .replace(/^\/+|\/+$/g, "")
    .replace(/^listings\//, "")
    .split("/")
    .map((segment) => segment.trim().replace(/[^a-zA-Z0-9_-]+/g, "-"))
    .filter(Boolean)
    .join("/");
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  return cleaned || `file-${Date.now()}`;
}

function resolveFileName(file: File, explicitName?: string): string {
  const typeExt = file.type?.split("/")[1] || "bin";
  const fallbackName = file.name || `file-${Date.now()}.${typeExt}`;
  const rawName = explicitName || fallbackName;
  const safeName = sanitizeFileName(rawName);
  return safeName.includes(".") ? safeName : `${safeName}.${typeExt}`;
}

function addUniqueSuffix(fileName: string): string {
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex <= 0) {
    return `${fileName}-${suffix}`;
  }

  return `${fileName.slice(0, dotIndex)}-${suffix}${fileName.slice(dotIndex)}`;
}

async function uploadViaCloudStorage(file: File, folder: string, fileName?: string): Promise<string> {
  const normalizedFolder = normalizeFolder(folder);
  const resolvedName = addUniqueSuffix(resolveFileName(file, fileName));
  const storagePath = normalizedFolder ? `${normalizedFolder}/${resolvedName}` : resolvedName;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error("Upload failed");
  }

  return data.publicUrl;
}

/**
 * Upload a file using the B2 edge function, with automatic fallback to Lovable Cloud storage.
 */
export async function uploadToB2(
  file: File | Blob,
  folder: string = "uploads",
  fileName?: string
): Promise<string> {
  if (file instanceof Blob && !(file instanceof File)) {
    const name = fileName || `file-${Date.now()}.webp`;
    file = new File([file], name, { type: file.type });
  }

  const uploadFile = file as File;
  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("folder", folder);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), EDGE_UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/upload-to-b2`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("B2 upload failed:", response.status, errText);
      let err: { error?: string } = { error: "Upload failed" };
      try {
        err = JSON.parse(errText);
      } catch {
        err = { error: errText || "Upload failed" };
      }
      throw new Error(err.error || "Upload failed");
    }

    const result = await response.json().catch(() => null);
    if (result?.url) {
      return result.url;
    }

    throw new Error("Upload failed");
  } catch (error) {
    console.warn("Primary upload failed, falling back to cloud storage:", error);
    return uploadViaCloudStorage(uploadFile, folder, fileName);
  } finally {
    window.clearTimeout(timeoutId);
  }
}
