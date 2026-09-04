import { supabase } from "@/integrations/supabase/client";

interface NotifyParams {
  title: string;
  message: string;
  type: string;
  relatedId?: string;
}

/**
 * Notify every admin about an event (upgrade request, listing edit, AI chat...).
 * Runs through the `notify-event` edge function because the notifications table
 * only allows admin inserts — the function validates the caller and writes with
 * the service role, which also fires the push-notification trigger.
 */
export async function notifyAdmins(params: NotifyParams): Promise<void> {
  try {
    await supabase.functions.invoke("notify-event", {
      body: { ...params, notifyAdmins: true },
    });
  } catch {
    // Non-critical — never block the user action.
    console.warn("Failed to send admin notifications");
  }
}

/**
 * Notify a specific user (the advertiser) about something that concerns them.
 * Regular users may only target themselves; admins may target any user.
 */
export async function notifyUser(
  targetUserId: string,
  params: NotifyParams & { alsoAdmins?: boolean },
): Promise<void> {
  try {
    await supabase.functions.invoke("notify-event", {
      body: {
        title: params.title,
        message: params.message,
        type: params.type,
        relatedId: params.relatedId,
        targetUserId,
        notifyAdmins: params.alsoAdmins === true,
      },
    });
  } catch {
    console.warn("Failed to send user notification");
  }
}
