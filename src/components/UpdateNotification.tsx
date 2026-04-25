import { useState, useEffect } from "react";
import { RefreshCw, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const UpdateNotification = () => {
  const [show, setShow] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("sw-update-ready", handler);
    return () => window.removeEventListener("sw-update-ready", handler);
  }, []);

  const handleReload = async () => {
    setReloading(true);
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch {
      // ignore cleanup errors
    }
    // Hard reload to ensure latest assets are fetched
    window.location.reload();
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setShow(false)}
      />
      {/* Notification */}
      <div className="fixed top-4 left-4 right-4 z-[10000] animate-in slide-in-from-top-4 duration-500 mx-auto max-w-md">
        <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl shadow-2xl p-5 border border-primary-foreground/10">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0 relative">
              <Sparkles className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base leading-tight">
                تحديث جديد متاح! 🎉
              </p>
              <p className="text-sm opacity-90 mt-1 leading-relaxed">
                تم إصدار نسخة جديدة من سوق الكل بميزات وتحسينات جديدة. قم بالتحديث الآن للحصول على أفضل تجربة.
              </p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors shrink-0"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 h-10 font-bold text-sm gap-2"
              onClick={handleReload}
              disabled={reloading}
            >
              <RefreshCw className={`h-4 w-4 ${reloading ? "animate-spin" : ""}`} />
              {reloading ? "جاري التحديث..." : "تحديث الآن"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-10 text-sm text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              onClick={() => setShow(false)}
            >
              لاحقاً
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateNotification;
