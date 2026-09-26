import { getNotificationRoute } from "@/lib/notificationRoute";
import { useState, useEffect, useCallback, useRef } from "react";
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

const SWIPE_THRESHOLD = 60;

const InAppNotificationBanner = () => {
  const [queue, setQueue] = useState<InAppNotification[]>([]);
  const [current, setCurrent] = useState<InAppNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  // Swipe state
  const [swipeY, setSwipeY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ y: number; time: number } | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent<InAppNotification>) => {
      setQueue((prev) => [...prev, e.detail]);
    };
    window.addEventListener("in-app-notification" as any, handler);
    return () => window.removeEventListener("in-app-notification" as any, handler);
  }, []);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const next = queue[0];
    setQueue((prev) => prev.slice(1));
    setCurrent(next);
    setIsVisible(true);
    setIsExiting(false);
    setSwipeY(0);
  }, [queue, current]);

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
      setSwipeY(0);
    }, 300);
  }, []);

  const handleClick = useCallback(() => {
    if (isSwiping) return;
    if (!current) return;
    const route = getNotificationRoute(current.type, current.related_id);
    if (route) navigate(route);
    dismiss();
  }, [current, navigate, dismiss, isSwiping]);

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { y: e.touches[0].clientY, time: Date.now() };
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    // Only allow swiping up (negative deltaY)
    const clampedY = Math.min(0, deltaY);
    setSwipeY(clampedY);
    if (Math.abs(deltaY) > 10) {
      setIsSwiping(true);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    if (swipeY < -SWIPE_THRESHOLD) {
      // Swiped up past threshold — dismiss
      dismiss();
    } else {
      // Snap back
      setSwipeY(0);
    }
    touchStartRef.current = null;
    setTimeout(() => setIsSwiping(false), 50);
  }, [swipeY, dismiss]);

  if (!isVisible || !current) return null;

  const config = typeConfig[current.type] || typeConfig.info;
  const Icon = config.icon;
  const opacity = isSwiping ? Math.max(0, 1 - Math.abs(swipeY) / 150) : 1;

  return (
    <div
      className={cn(
        "fixed top-4 left-4 right-4 z-[9999] mx-auto max-w-md touch-pan-x",
        !isSwiping && "transition-all duration-300 ease-out",
        isExiting && "opacity-0 -translate-y-full scale-95"
      )}
      style={{
        transform: isExiting ? undefined : `translateY(${swipeY}px)`,
        opacity: isExiting ? undefined : opacity,
      }}
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe hint bar */}
      <div className="flex justify-center mb-1">
        <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
      </div>

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
          <div className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", config.bgColor)}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>

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
