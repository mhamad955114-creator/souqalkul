import { Bell, CheckCheck } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { getNotificationRoute } from "@/lib/notificationRoute";

const NotificationsDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const labels = {
    ar: { notifications: "الإشعارات", markAll: "تحديد الكل كمقروء", noNotifications: "لا توجد إشعارات" },
    en: { notifications: "Notifications", markAll: "Mark all as read", noNotifications: "No notifications" },
    tr: { notifications: "Bildirimler", markAll: "Tümünü okundu işaretle", noNotifications: "Bildirim yok" },
  };

  const l = labels[language];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-1rem)] max-w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold text-sm">{l.notifications}</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
              <CheckCheck className="h-3 w-3 mr-1" />
              {l.markAll}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[min(60vh,28rem)] touch-pan-y overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {l.noNotifications}
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notif.is_read ? "bg-primary/5" : ""}`}
                onClick={() => {
                  if (!notif.is_read) markAsRead(notif.id);
                  const route = getNotificationRoute(notif.type, notif.related_id);
                  if (route) setTimeout(() => navigate(route), 50);
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium text-sm flex-1">{notif.title}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(notif.created_at)}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
