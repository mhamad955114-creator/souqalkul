import { useState } from "react";
import { Check, Star, Zap, Crown, ArrowLeft, ArrowRight, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { formatPrice } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { useListingSettings } from "@/hooks/useListingSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notifyAdmins } from "@/lib/notifyAdmins";

const Pricing = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { settings, loading: settingsLoading } = useListingSettings();
  const { user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [shamcashAccount, setShamcashAccount] = useState("0999999999");

  // Load shamcash account from settings
  useState(() => {
    supabase.from("listing_settings").select("setting_value").eq("setting_key", "shamcash_account").single().then(({ data }) => {
      if (data?.setting_value) {
        const val = typeof data.setting_value === "string" ? data.setting_value : String(data.setting_value);
        if (val && val !== "{}") setShamcashAccount(val);
      }
    });
  });

  const BackArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const pricingPlans = [
    {
      name: t.pricing.free,
      price: 0,
      duration: t.pricing.forever,
      description: t.pricing.forNewUsers,
      icon: Zap,
      iconColor: "text-green-500",
      borderColor: "border-green-200",
      bgColor: "bg-green-50",
      features: [
        `نشر ${settings.free_listing.max_active_listings} إعلان`,
        `مدة الإعلان ${settings.free_listing.duration_days} يوم`,
        t.pricing.freeFeature3,
        `حتى ${settings.free_listing.max_images} صور للإعلان`,
        t.pricing.freeFeature5,
      ],
      notIncluded: [
        t.pricing.freeNot1,
        t.pricing.freeNot2,
        t.pricing.freeNot3,
      ],
      buttonText: t.pricing.startFree,
      buttonVariant: "outline" as const,
    },
    {
      name: t.pricing.featured,
      price: settings.featured_listing.price || 10000,
      duration: `${settings.featured_listing.duration_days} يوم`,
      description: t.pricing.mostPopular,
      icon: Star,
      iconColor: "text-amber-500",
      borderColor: "border-amber-300",
      bgColor: "bg-amber-50",
      popular: true,
      features: [
        `نشر ${settings.featured_listing.max_active_listings === -1 ? 'غير محدود من' : settings.featured_listing.max_active_listings} إعلان`,
        `مدة الإعلان ${settings.featured_listing.duration_days} يوم`,
        t.pricing.featuredFeature3,
        t.pricing.featuredFeature4,
        `حتى ${settings.featured_listing.max_images} صور للإعلان`,
        t.pricing.featuredFeature6,
        t.pricing.featuredFeature7,
      ],
      notIncluded: [
        t.pricing.featuredNot1,
      ],
      buttonText: t.pricing.subscribeNow,
      buttonVariant: "default" as const,
    },
    {
      name: t.pricing.professional,
      price: settings.professional_listing.price || 20000,
      duration: `${settings.professional_listing.duration_days} يوم`,
      description: t.pricing.forProfessionals,
      icon: Crown,
      iconColor: "text-purple-500",
      borderColor: "border-purple-300",
      bgColor: "bg-purple-50",
      features: [
        `نشر ${settings.professional_listing.max_active_listings === -1 ? 'غير محدود من' : settings.professional_listing.max_active_listings} الإعلانات`,
        `مدة الإعلان ${settings.professional_listing.duration_days} يوم`,
        t.pricing.proFeature3,
        t.pricing.proFeature4,
        `حتى ${settings.professional_listing.max_images} صورة للإعلان`,
        t.pricing.proFeature6,
        t.pricing.proFeature7,
        t.pricing.proFeature8,
        t.pricing.proFeature9,
      ],
      notIncluded: [],
      buttonText: t.pricing.subscribeNow,
      buttonVariant: "default" as const,
    },
    {
      name: "رجال الأعمال",
      price: settings.business_listing.price || 100000,
      duration: `${settings.business_listing.duration_days} يوم`,
      description: "للشركات والمؤسسات",
      icon: null,
      customIcon: true,
      iconColor: "text-blue-500",
      borderColor: "border-blue-300",
      bgColor: "bg-blue-50",
      features: [
        `رفع حتى ${settings.business_listing.max_images} صورة`,
        `مدة ظهور ${settings.business_listing.duration_days} يوم`,
        `${settings.business_listing.max_active_listings === -1 ? 'إعلانات غير محدودة' : `حتى ${settings.business_listing.max_active_listings} إعلان`}`,
        "أولوية قصوى في نتائج البحث",
        "شارة رجال أعمال مميزة 💎",
        "دعم فني مخصص",
        "ظهور في القسم المميز",
        "إحصائيات متقدمة",
        "جميع مزايا الباقة الاحترافية",
      ],
      notIncluded: [],
      buttonText: t.pricing.subscribeNow,
      buttonVariant: "default" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <BackArrow className="h-4 w-4" />
          {t.pricing.back}
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t.pricing.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.borderColor} ${
                plan.popular ? "border-2 scale-105 shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-center text-sm py-1 font-medium">
                  {t.pricing.mostPopular}
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? "pt-10" : "pt-6"}`}>
                <div className={`w-16 h-16 mx-auto rounded-full ${plan.bgColor} flex items-center justify-center mb-4`}>
                  {(plan as any).customIcon ? (
                    <span className="text-4xl inline-block animate-diamond-spin">💎</span>
                  ) : (
                    <plan.icon className={`h-8 w-8 ${plan.iconColor}`} />
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? t.pricing.freeText : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground text-sm mx-1">
                      / {plan.duration}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 opacity-50">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">✕</span>
                      </div>
                      <span className="text-sm line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  variant={plan.buttonVariant}
                  className={`w-full ${
                    plan.popular
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : ""
                  }`}
                  onClick={() => {
                    if (plan.price === 0) {
                      navigate("/");
                    } else if (!user) {
                      toast.error("يرجى تسجيل الدخول أولاً");
                    } else {
                      setSelectedPlan(plan);
                    }
                  }}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">{t.pricing.faq}</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.pricing.faqQ1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.pricing.faqA1}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.pricing.faqQ2}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.pricing.faqA2}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.pricing.faqQ3}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.pricing.faqA3}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={(open) => { if (!open) { setSelectedPlan(null); setTransactionNumber(""); setReceiptFile(null); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>شراء باقة {selectedPlan?.name}</DialogTitle>
              <DialogDescription>
                أرسل المبلغ عبر شام كاش ثم أدخل رقم العملية
              </DialogDescription>
            </DialogHeader>
            {selectedPlan && (
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">سعر الباقة:</span>
                  <span className="font-bold text-lg">{formatPrice(selectedPlan.price)}</span>
                </div>
                
                {/* ShamCash Account */}
                <div className="bg-muted/50 border border-border rounded-lg p-4 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">أرسل المبلغ إلى حساب شام كاش:</p>
                  <p className="text-xl font-bold font-mono tracking-widest text-primary" dir="ltr">{shamcashAccount}</p>
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(shamcashAccount); toast.success("تم نسخ الرقم"); }}>
                    نسخ الرقم
                  </Button>
                </div>

                {/* Transaction Number */}
                <div className="space-y-2">
                  <Label>رقم العملية (إلزامي)</Label>
                  <Input
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    placeholder="أدخل رقم عملية التحويل"
                    dir="ltr"
                    className="font-mono"
                  />
                </div>

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <Label>صورة الإيصال (اختياري)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setSelectedPlan(null); setTransactionNumber(""); setReceiptFile(null); }}>إلغاء</Button>
              <Button
                disabled={purchasing || !transactionNumber.trim()}
                onClick={async () => {
                  if (!selectedPlan || !user || !transactionNumber.trim()) return;
                  setPurchasing(true);
                  try {
                    let durationDays: number;
                    let planType: string;
                    if (selectedPlan.name === t.pricing.featured) {
                      durationDays = settings.featured_listing.duration_days;
                      planType = "featured";
                    } else if (selectedPlan.name === "رجال الأعمال") {
                      durationDays = settings.business_listing.duration_days;
                      planType = "business";
                    } else {
                      durationDays = settings.professional_listing.duration_days;
                      planType = "professional";
                    }

                    // Upload receipt if provided
                    let receiptUrl: string | null = null;
                    if (receiptFile) {
                      const ext = receiptFile.name.split('.').pop();
                      const path = `${user.id}/${Date.now()}.${ext}`;
                      const { error: uploadError } = await supabase.storage.from('receipts').upload(path, receiptFile);
                      if (!uploadError) {
                        receiptUrl = path;
                      }
                    }

                    // Submit payment request
                    const { error: insertError } = await supabase.from("top_up_requests").insert({
                      user_id: user.id,
                      amount: selectedPlan.price,
                      transaction_number: transactionNumber.trim(),
                      receipt_url: receiptUrl,
                      plan_type: planType,
                      duration_days: durationDays,
                    });

                    if (insertError) throw insertError;

                    // Notify admins
                    notifyAdmins({
                      title: "طلب اشتراك جديد 💳",
                      message: `طلب شراء باقة ${selectedPlan.name} بمبلغ ${selectedPlan.price.toLocaleString("en-US")} ل.س - رقم العملية: ${transactionNumber}`,
                      type: "subscription_request",
                      relatedId: user.id,
                    });

                    toast.success("تم إرسال طلبك بنجاح! سيتم مراجعته وتفعيل الباقة قريباً 🎉");
                    setSelectedPlan(null);
                    setTransactionNumber("");
                    setReceiptFile(null);
                  } catch (err: any) {
                    toast.error("فشل في إرسال الطلب: " + (err.message || "خطأ"));
                  } finally {
                    setPurchasing(false);
                  }
                }}
              >
                {purchasing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Upload className="h-4 w-4 ml-2" />}
                إرسال طلب الاشتراك
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Pricing;