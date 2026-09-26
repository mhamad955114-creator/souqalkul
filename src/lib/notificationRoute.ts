export const getNotificationRoute = (type: string, relatedId: string | null): string | null => {
  if (type === "new_message") return relatedId ? `/messages?listing=${relatedId}` : "/messages";
  if (type === "ai_reply" || type === "ai_thread_created") return relatedId ? `/ai/${relatedId}` : "/ai";
  if (type === "admin_report" || type === "report_update") return "/admin/reports";
  return relatedId ? `/listing/${relatedId}` : null;
};
