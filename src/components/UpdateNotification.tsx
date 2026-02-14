import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const UpdateNotification = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener('sw-update-ready', handler);
    return () => window.removeEventListener('sw-update-ready', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[10000] animate-in slide-in-from-top-4 duration-500 mx-auto max-w-md">
      <div className="bg-primary text-primary-foreground rounded-xl shadow-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
          <RefreshCw className="h-5 w-5 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">تحديث جديد متاح! 🎉</p>
          <p className="text-xs opacity-90 mt-0.5">يرجى تحديث الصفحة للحصول على أحدث نسخة</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-3 text-xs font-bold"
            onClick={() => window.location.reload()}
          >
            تحديث
          </Button>
          <button
            onClick={() => setShow(false)}
            className="p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
