import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all admin user IDs from the user_roles table.
 */
async function getAdminUserIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  if (error || !data) return [];
  return data.map((r) => r.user_id);
}

/**
 * Send a notification to all admin users.
 * Silently fails if the insert errors (non-critical).
 */

export async function notifyAdmins(params: {
  title: string;
  message: string;
  type: string;
  relatedId?: string;
}): Promise<void> {
  try {
    const adminIds = await getAdminUserIds();
    if (adminIds.length === 0) return;

    const rows = adminIds.map((adminId) => ({
      user_id: adminId,
      title: params.title,
      message: params.message,
      type: params.type,
      related_id: params.relatedId || null,
    }));

    await supabase.from("notifications").insert(rows);
  } catch {
    // Non-critical — don't block the user action if notification fails
    console.warn("Failed to send admin notifications");
  }
}
