import { useState, useEffect, useCallback } from "react";
import { X, MessageSquare, Bell, Tag, ShieldAlert, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id: string | null;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  new_message: { icon: MessageSquare, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  offer: { icon: Tag, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  admin: { icon: ShieldAlert, color: "text-red-500", bgColor: "bg-red-500/10" },
  info: { icon: Bell, color: "text-primary", bgColor: "bg-primary/10" },
};

const InAppNotificationBanner = () => {
  const [queue, setQueue] = useState<InAppNotification[]>([]);
  const [current, setCurrent] = useState<InAppNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  // Listen for custom events dispatched from the notification hook
  useEffect(() => {
    const handler = (e: CustomEvent<InAppNotification>) => {
      setQueue((prev) => [...prev, e.detail]);
    };
    window.addEventListener("in-app-notification" as any, handler);
    return () => window.removeEventListener("in-app-notification" as any, handler);
  }, []);

  // Process queue
  useEffect(() => {
    if (current || queue.length === 0) return;
    const next = queue[0];
    setQueue((prev) => prev.slice(1));
    setCurrent(next);
    setIsVisible(true);
    setIsExiting(false);
  }, [queue, current]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => dismiss(), 6000);
    return () => clearTimeout(timer);
  }, [current]);

  const dismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      setCurrent(null);
    }, 300);
  }, []);

  const handleClick = useCallback(() => {
    if (!current) return;
    if (current.type === "new_message" && current.related_id) {
      navigate(`/listing/${current.related_id}`);
    } else if (current.related_id) {
      navigate(`/listing/${current.related_id}`);
    }
    dismiss();
  }, [current, navigate, dismiss]);

  if (!isVisible || !current) return null;

  const config = typeConfig[current.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "fixed top-4 left-4 right-4 z-[9999] mx-auto max-w-md",
        "transition-all duration-300 ease-out",
        isExiting
          ? "opacity-0 -translate-y-4 scale-95"
          : "opacity-100 translate-y-0 scale-100"
      )}
      dir="rtl"
    >
      <div
        className="relative bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted overflow-hidden">
          <div
            className="h-full bg-primary animate-shrink-width"
            style={{ animationDuration: "6s" }}
          />
        </div>

        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", config.bgColor)}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{current.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{current.message}</p>
            {current.related_id && (
              <div className="flex items-center gap-1 mt-1.5">
                <ExternalLink className="h-3 w-3 text-primary" />
                <span className="text-[10px] text-primary font-medium">اضغط للعرض</span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            className="shrink-0 w-7 h-7 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper to dispatch in-app notifications from anywhere
export const showInAppNotification = (notification: InAppNotification) => {
  window.dispatchEvent(
    new CustomEvent("in-app-notification", { detail: notification })
  );
};

export default InAppNotificationBanner;
