import { Check, Star, Zap, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { formatPrice } from "@/lib/constants";

const pricingPlans = [
  {
    name: "مجاني",
    price: 0,
    duration: "دائم",
    description: "للمستخدمين الجدد",
    icon: Zap,
    iconColor: "text-green-500",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    features: [
      "نشر إعلان واحد",
      "مدة الإعلان 30 يوم",
      "يظهر بعد الإعلانات المدفوعة",
      "صورة واحدة للإعلان",
      "دعم فني أساسي",
    ],
    notIncluded: [
      "التثبيت في أعلى القائمة",
      "الشارة الذهبية",
      "إحصائيات المشاهدات",
    ],
    buttonText: "ابدأ مجاناً",
    buttonVariant: "outline" as const,
  },
  {
    name: "مميز",
    price: 50000,
    duration: "شهرياً",
    description: "الأكثر شعبية",
    icon: Star,
    iconColor: "text-amber-500",
    borderColor: "border-amber-300",
    bgColor: "bg-amber-50",
    popular: true,
    features: [
      "نشر 5 إعلانات",
      "مدة الإعلان 60 يوم",
      "التثبيت في أعلى القائمة",
      "الشارة الذهبية المميزة",
      "حتى 10 صور للإعلان",
      "إحصائيات المشاهدات",
      "دعم فني متقدم",
    ],
    notIncluded: [
      "أولوية في نتائج البحث",
    ],
    buttonText: "اشترك الآن",
    buttonVariant: "default" as const,
  },
  {
    name: "احترافي",
    price: 100000,
    duration: "شهرياً",
    description: "للمحترفين والشركات",
    icon: Crown,
    iconColor: "text-purple-500",
    borderColor: "border-purple-300",
    bgColor: "bg-purple-50",
    features: [
      "نشر غير محدود للإعلانات",
      "مدة الإعلان 90 يوم",
      "التثبيت في أعلى القائمة",
      "الشارة الذهبية المميزة",
      "حتى 20 صور للإعلان",
      "إحصائيات مفصلة",
      "أولوية في نتائج البحث",
      "دعم فني على مدار الساعة",
      "شارة تاجر موثوق",
    ],
    notIncluded: [],
    buttonText: "اشترك الآن",
    buttonVariant: "default" as const,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          رجوع
        </Button>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            أسعار الإعلانات المدفوعة
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اختر الخطة المناسبة لك واحصل على مميزات حصرية لإعلاناتك
          </p>
        </div>

        {/* Pricing Cards */}
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
                  الأكثر شعبية
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? "pt-10" : "pt-6"}`}>
                <div className={`w-16 h-16 mx-auto rounded-full ${plan.bgColor} flex items-center justify-center mb-4`}>
                  <plan.icon className={`h-8 w-8 ${plan.iconColor}`} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "مجاني" : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground text-sm mr-1">
                      / {plan.duration}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {/* Not Included */}
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
                  onClick={() => navigate("/")}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">الأسئلة الشائعة</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">كيف يتم الدفع؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  يمكنك الدفع عبر التحويل البنكي أو الدفع الإلكتروني. بعد إتمام الدفع، سيتم تفعيل الباقة خلال 24 ساعة.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل يمكنني إلغاء الاشتراك؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  نعم، يمكنك إلغاء الاشتراك في أي وقت. سيستمر حسابك المدفوع حتى نهاية فترة الفوترة الحالية.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ما الفرق بين الإعلان المجاني والمدفوع؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  الإعلانات المدفوعة تظهر دائماً في أعلى نتائج البحث، وتحصل على شارة ذهبية مميزة، مما يزيد من فرص مشاهدتها والتواصل معك.
                </p>
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
