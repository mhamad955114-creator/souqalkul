import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Check, Share2, Wifi, WifiOff, Zap, Shield, Bell } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

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

  useEffect(() => {
    if (isIOS || (!deferredPrompt && !isInstalled)) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 3);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isIOS, deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Zap, label: "سريع جداً", desc: "تحميل فوري بدون انتظار" },
    { icon: WifiOff, label: "بدون إنترنت", desc: "يعمل حتى بدون اتصال" },
    { icon: Shield, label: "آمن", desc: "بياناتك محمية بالكامل" },
    { icon: Bell, label: "إشعارات", desc: "تنبيهات فورية للعروض" },
    { icon: Smartphone, label: "كالتطبيق الأصلي", desc: "تجربة سلسة كتطبيق حقيقي" },
    { icon: Download, label: "مجاني تماماً", desc: "بدون أي تكلفة إضافية" },
  ];

  const iosSteps = [
    { step: 1, text: "اضغط على زر المشاركة", icon: Share2 },
    { step: 2, text: 'اختر "إضافة إلى الشاشة الرئيسية"', icon: Smartphone },
    { step: 3, text: 'اضغط "إضافة" للتثبيت', icon: Check },
  ];

  const androidSteps = [
    { step: 1, text: "افتح قائمة المتصفح (⋮)", icon: Smartphone },
    { step: 2, text: 'اختر "تثبيت التطبيق"', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background py-12 px-4">
          {/* Floating circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-0 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000" />
          </div>

          <div className="max-w-md mx-auto text-center relative z-10 space-y-6">
            {/* Logo with glow */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl scale-110" />
              <img
                src={logo}
                alt="سوق الكل"
                className="relative w-24 h-24 rounded-3xl shadow-lg mx-auto"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">ثبّت سوق الكل</h1>
              <p className="text-muted-foreground text-lg">
                احصل على تجربة أفضل مباشرة من شاشتك الرئيسية
              </p>
            </div>

            {/* Install CTA */}
            {isInstalled ? (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 space-y-2">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <p className="font-bold text-lg text-foreground">التطبيق مثبّت بالفعل! 🎉</p>
                <p className="text-sm text-muted-foreground">يمكنك فتحه من الشاشة الرئيسية</p>
              </div>
            ) : deferredPrompt ? (
              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={handleInstall}
                  className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                >
                  <Download className="h-6 w-6" />
                  تثبيت التطبيق الآن
                </Button>
                <p className="text-xs text-muted-foreground">مجاني • لا يحتاج متجر تطبيقات</p>
              </div>
            ) : null}
          </div>
        </section>

        {/* Steps for iOS / Android fallback */}
        {!isInstalled && (isIOS || !deferredPrompt) && (
          <section className="py-8 px-4">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold text-foreground text-center mb-6">
                {isIOS ? "خطوات التثبيت على iPhone" : "خطوات التثبيت على Android"}
              </h2>
              <div className="space-y-4">
                {(isIOS ? iosSteps : androidSteps).map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeStep === index;
                  return (
                    <div
                      key={item.step}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-500 ${
                        isActive
                          ? "border-primary bg-primary/5 scale-[1.02] shadow-md"
                          : "border-border bg-card"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">الخطوة {item.step}</p>
                        <p className="font-semibold text-foreground">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Features Grid */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">
              لماذا تثبّت التطبيق؟
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="bg-card border border-border rounded-2xl p-4 text-center space-y-2 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-8 px-4">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">
              المتصفح vs التطبيق
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-muted-foreground" />
                  <p className="font-semibold text-foreground text-sm">المتصفح</p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>❌ يحتاج فتح المتصفح</li>
                  <li>❌ تحميل بطيء</li>
                  <li>❌ بدون إشعارات</li>
                </ul>
              </div>
              <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-4 space-y-3 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full">
                  أفضل
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground text-sm">التطبيق</p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>✅ وصول من الشاشة</li>
                  <li>✅ تحميل فوري</li>
                  <li>✅ إشعارات فورية</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Install;
