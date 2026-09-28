import { useState } from "react";
import { Check, Crown, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContactSettings, buildWhatsAppUrl } from "@/hooks/useContactSettings";
import { useAuth } from "@/hooks/useAuth";
import { useListingSettings } from "@/hooks/useListingSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notifyAdmins } from "@/lib/notifyAdmins";
import { useCustomPlans, customPlanName, customPlanFeatures } from "@/lib/customPlans";

const Pricing = () => {
  const navigate = useNavigate();
  const { t, dir, language } = useLanguage();
  const { plans: customPlans } = useCustomPlans();
  const { contact } = useContactSettings();
  const { user } = useAuth();
  const { settings } = useListingSettings();
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);

  const BackArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const formatNum = (n: number) => new Intl.NumberFormat("en-US").format(n);
  const formatLimit = (n: number) => (n < 0 ? t.pricing.planUnlimited : formatNum(n));

  const plans: Array<{ key: string; name: string; icon?: any; customIcon?: boolean; iconColor: string; bgColor: string; borderColor: string; features: string[]; price: number; durationDays: number; maxActive: number; maxImages: number; color?: string }> = [
    {
      key: "featured",
      name: t.pricing.featuredName,
      icon: Crown,
      iconColor: "gold-crown",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      features: [t.pricing.featuredF1, t.pricing.featuredF2, t.pricing.featuredF3],
      price: settings.featured_listing.price ?? 0,
      durationDays: settings.featured_listing.duration_days,
      maxActive: settings.featured_listing.max_active_listings,
      maxImages: settings.featured_listing.max_images,
    },
    {
      key: "professional",
      name: t.pricing.professionalName,
      icon: Crown,
      iconColor: "gold-crown",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      features: [t.pricing.proF1, t.pricing.proF2, t.pricing.proF3, t.pricing.proF4],
      price: settings.professional_listing.price ?? 0,
      durationDays: settings.professional_listing.duration_days,
      maxActive: settings.professional_listing.max_active_listings,
      maxImages: settings.professional_listing.max_images,
    },
    {
      key: "business",
      name: t.pricing.businessName,
      customIcon: true,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      features: [t.pricing.bizF1, t.pricing.bizF2, t.pricing.bizF3, t.pricing.bizF4],
      price: settings.business_listing.price ?? 0,
      durationDays: settings.business_listing.duration_days,
      maxActive: settings.business_listing.max_active_listings,
      maxImages: settings.business_listing.max_images,
    },
    ...customPlans.filter((cp) => cp.is_active).map((cp) => ({
      key: cp.plan_key,
      name: customPlanName(cp.plan_key, language),
       icon: Crown,
      iconColor: "gold-crown",
      bgColor: "bg-muted",
      borderColor: "",
      color: cp.color,
      features: customPlanFeatures(cp, language),
      price: Number(cp.price),
      durationDays: cp.duration_days,
      maxActive: cp.max_active_listings,
      maxImages: cp.max_images,
    })),
  ];

  const handlePlanRequest = async (plan: (typeof plans)[number]) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const transactionNumber = `REQ-${Date.now()}`;
    const message = `مرحباً، أريد طلب ${plan.name}. رقم الطلب: ${transactionNumber}`;

    try {
      setSubmittingPlan(plan.key);

      const { error } = await supabase.from("top_up_requests").insert({
        user_id: user.id,
        amount: plan.price,
        plan_type: plan.key,
        duration_days: plan.durationDays,
        transaction_number: transactionNumber,
        status: "pending",
      });

      if (error) throw error;

      toast.success("تم إرسال طلب الترقية وسيظهر في لوحة التحكم");

      await notifyAdmins({
        title: "طلب ترقية جديد",
        message: `طلب ترقية إلى ${plan.name} برقم ${transactionNumber}`,
        type: "upgrade_request",
      });
      window.open(buildWhatsAppUrl(contact.whatsapp, message), "_blank", "noopener,noreferrer");
    } catch {
      toast.error("تعذر إرسال طلب الترقية، حاول مرة أخرى");
    } finally {
      setSubmittingPlan(null);
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.borderColor}`}
              style={plan.color ? { borderColor: plan.color, borderWidth: 2 } : undefined}
            >
              <CardHeader className="text-center pt-6">
                <div className={`w-16 h-16 mx-auto rounded-full ${plan.bgColor} flex items-center justify-center mb-4`}>
                  {plan.customIcon ? (
                    <span className="text-4xl inline-block animate-diamond-spin">💎</span>
                  ) : (
                    <plan.icon className={`h-8 w-8 ${plan.iconColor}`} style={plan.color ? { color: plan.color } : undefined} />
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-3xl font-bold text-primary mt-2" dir="ltr">
                  {formatNum(plan.price)} <span className="text-base font-normal">ل.س</span>
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-muted/40 divide-y text-sm">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-muted-foreground">{t.pricing.planDuration}</span>
                    <span className="font-semibold" dir="ltr">
                      {formatNum(plan.durationDays)} {t.pricing.planDays}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-muted-foreground">{t.pricing.planActiveListings}</span>
                    <span className="font-semibold" dir="ltr">{formatLimit(plan.maxActive)}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-muted-foreground">{t.pricing.planImages}</span>
                    <span className="font-semibold" dir="ltr">{formatLimit(plan.maxImages)}</span>
                  </div>
                </div>

                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePlanRequest(plan)}
                  disabled={submittingPlan === plan.key}
                >
                  {submittingPlan === plan.key ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t.pricing.requestPlan}
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
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Pricing;
