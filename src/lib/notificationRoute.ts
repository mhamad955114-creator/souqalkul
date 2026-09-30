const LISTING_TYPES = new Set([
  "listing_approved",
  "listing_rejected",
  "listing_published",
  "listing_published_owner",
  "listing_updated",
  "listing_expired",
  "admin_message",
  "admin_message_reply",
  "rating",
  "new_rating",
  "favorite",
]);

export const getNotificationRoute = (type: string, relatedId: string | null): string | null => {
  if (type === "new_message") return relatedId ? `/messages?listing=${relatedId}` : "/messages";
  if (type === "ai_reply" || type === "ai_thread_created") return relatedId ? `/ai/${relatedId}` : "/ai";
  if (type === "admin_report" || type === "report_update" || type === "upgrade_request" || type === "plan_request" || type === "storage_alert")
    return "/admin/reports";
  if (type.startsWith("subscription") || type === "payment" || type === "system") return "/my-account";
  if (type.startsWith("reward") || type === "referral") return "/rewards";
  if (LISTING_TYPES.has(type) && relatedId) return `/listing/${relatedId}`;
  return null;
};
