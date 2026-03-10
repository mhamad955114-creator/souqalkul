import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Star, Briefcase, ArrowRight, ArrowLeft, Clock, CalendarDays, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/constants";

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

const planConfig: Record<string, {
  label: string;
  icon: React.ReactNode;
  gradient: string;
  bgClass: string;
  emoji: string;
  features: string[];
}> = {
  featured: {
    label: "باقة مميزة",
    icon: <Star className="h-6 w-6" />,
    gradient: "from-amber-500 to-orange-500",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    emoji: "⭐",
    features: [
      "ظهور إعلاناتك في أعلى نتائج البحث",
      "شارة مميزة على جميع إعلاناتك",
      "جذب المزيد من المشترين",
    ],
  },
  professional: {
    label: "باقة احترافية",
    icon: <Crown className="h-6 w-6" />,
    gradient: "from-purple-600 to-indigo-600",
    bgClass: "bg-purple-50 dark:bg-purple-950/30",
    emoji: "👑",
    features: [
      "شارة احترافية مميزة 👑",
      "أولوية في الظهور فوق الإعلانات العادية",
      "تعزيز ثقة المشترين بك",
      "جميع مزايا الباقة المميزة",
    ],
  },
  business: {
    label: "باقة رجال الأعمال",
    icon: <Briefcase className="h-6 w-6" />,
    gradient: "from-blue-600 to-cyan-500",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    emoji: "💎",
    features: [
      "شارة ماسية متوهجة 💎",
      "تثبيت إعلاناتك في أعلى القوائم 📌",
      "إحصائيات أداء متقدمة",
      "أولوية قصوى في الظهور",
      "جميع مزايا الباقة الاحترافية",
    ],
  },
};

const MySubscriptions = () => {
  const { user, loading: authLoading } = useAuth();
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const BackArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchSubs = async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSubscriptions(data || []);
      setLoading(false);
    };
    fetchSubs();
  }, [user]);

  const isActive = (sub: Subscription) =>
    sub.status === "active" && new Date(sub.expires_at) > new Date();

  const getRemainingDays = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const activeSubs = subscriptions.filter(isActive);
  const expiredSubs = subscriptions.filter((s) => !isActive(s));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <BackArrow className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">اشتراكاتي</h1>
            <p className="text-sm text-muted-foreground">إدارة ومتابعة جميع باقاتك</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          /* Empty state */
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">لا توجد اشتراكات</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  لم تقم بشراء أي باقة بعد. اطلع على الباقات المتاحة لتعزيز إعلاناتك
                </p>
              </div>
              <Button
                onClick={() => navigate("/pricing")}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Sparkles className="h-4 w-4 ml-2" />
                استعرض الباقات
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active subscriptions */}
            {activeSubs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <h2 className="text-lg font-bold text-foreground">
                    الباقات النشطة ({activeSubs.length})
                  </h2>
                </div>
                {activeSubs.map((sub) => {
                  const config = planConfig[sub.plan_type];
                  const remaining = getRemainingDays(sub.expires_at);
                  const isExpiringSoon = remaining <= 3;

                  if (!config) return null;

                  return (
                    <Card
                      key={sub.id}
                      className={`overflow-hidden border-0 shadow-lg ${config.bgClass}`}
                    >
                      {/* Gradient header */}
                      <div
                        className={`bg-gradient-to-r ${config.gradient} p-4 text-white flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{config.emoji}</span>
                          <div>
                            <h3 className="font-bold text-lg">{config.label}</h3>
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs mt-1">
                              نشطة
                            </Badge>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-2xl font-bold">{remaining}</div>
                          <div className="text-xs opacity-80">يوم متبقي</div>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-4">
                        {/* Warning if expiring soon */}
                        {isExpiringSoon && (
                          <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg px-3 py-2 text-sm">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>باقتك على وشك الانتهاء! جدّدها للحفاظ على المزايا</span>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-muted-foreground text-xs">تاريخ البدء</div>
                              <div className="font-medium text-foreground">{formatDate(sub.starts_at)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-muted-foreground text-xs">تاريخ الانتهاء</div>
                              <div className="font-medium text-foreground">{formatDate(sub.expires_at)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>المدة المتبقية</span>
                            <span>{remaining} يوم</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${config.gradient} h-2 rounded-full transition-all`}
                              style={{
                                width: `${Math.min(100, (remaining / Math.max(1, Math.ceil((new Date(sub.expires_at).getTime() - new Date(sub.starts_at).getTime()) / (1000 * 60 * 60 * 24)))) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground">مزايا الباقة:</h4>
                          <ul className="space-y-1.5">
                            {config.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="text-green-500 text-xs">✓</span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Expired subscriptions */}
            {expiredSubs.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-muted-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  الباقات المنتهية ({expiredSubs.length})
                </h2>
                {expiredSubs.map((sub) => {
                  const config = planConfig[sub.plan_type];
                  if (!config) return null;

                  return (
                    <Card key={sub.id} className="opacity-60">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl grayscale">{config.emoji}</span>
                          <div>
                            <h3 className="font-semibold text-foreground">{config.label}</h3>
                            <p className="text-xs text-muted-foreground">
                              انتهت في {formatDate(sub.expires_at)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">منتهية</Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Upgrade CTA */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">ترقية أو تجديد؟</h3>
                  <p className="text-xs text-muted-foreground">اطلع على جميع الباقات المتاحة</p>
                </div>
                <Button size="sm" onClick={() => navigate("/pricing")}>
                  <Sparkles className="h-4 w-4 ml-1" />
                  الباقات
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default MySubscriptions;
