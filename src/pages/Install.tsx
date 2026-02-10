import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Check, Share2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">تثبيت سوق الكل</h1>
          <p className="text-muted-foreground">
            ثبّت التطبيق على جهازك للوصول السريع والاستخدام بدون إنترنت
          </p>

          {isInstalled ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Check className="h-6 w-6" />
              <span className="font-semibold">التطبيق مثبّت بالفعل!</span>
            </div>
          ) : isIOS ? (
            <div className="bg-muted rounded-xl p-4 space-y-3 text-right">
              <p className="font-semibold text-foreground">للتثبيت على iPhone/iPad:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  اضغط على زر المشاركة <Share2 className="h-4 w-4 inline" />
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  اختر "إضافة إلى الشاشة الرئيسية"
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  اضغط "إضافة"
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            <Button size="lg" onClick={handleInstall} className="w-full">
              <Download className="h-5 w-5" />
              تثبيت التطبيق
            </Button>
          ) : (
            <div className="bg-muted rounded-xl p-4 space-y-3 text-right">
              <p className="font-semibold text-foreground">للتثبيت على Android:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  افتح قائمة المتصفح (⋮)
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"
                </li>
              </ol>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { label: "سريع", desc: "تحميل فوري" },
              { label: "بدون إنترنت", desc: "يعمل أوفلاين" },
              { label: "مجاني", desc: "بدون تكلفة" },
            ].map((feature) => (
              <div key={feature.label} className="bg-muted rounded-lg p-3">
                <p className="font-semibold text-sm text-foreground">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Install;
