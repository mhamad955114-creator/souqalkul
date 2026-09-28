import { customPlanName } from "@/lib/customPlans";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft, Receipt, FileText } from "lucide-react";

interface PaymentRequest {
  id: string;
  amount: number;
  transaction_number: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  plan_type: string | null;
  duration_days: number | null;
  receipt_url: string | null;
}

const statusConfig: Record<string, { label: string; labelEn: string; variant: "default" | "secondary" | "destructive"; icon: React.ReactNode; color: string }> = {
  pending: { label: "قيد المراجعة", labelEn: "Pending", variant: "secondary", icon: <Clock className="w-4 h-4" />, color: "text-yellow-600" },
  approved: { label: "تمت الموافقة", labelEn: "Approved", variant: "default", icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600" },
  rejected: { label: "مرفوض", labelEn: "Rejected", variant: "destructive", icon: <XCircle className="w-4 h-4" />, color: "text-red-600" },
};

const planLabels: Record<string, { ar: string; en: string }> = {
  featured: { ar: "باقة مميزة", en: "Featured" },
  professional: { ar: "باقة احترافية", en: "Professional" },
  business: { ar: "باقة رجال الأعمال", en: "Business" },
};

const MyPaymentRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchRequests();

    // Realtime subscription for status updates
    const channel = supabase
      .channel('my-payment-requests')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'top_up_requests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as PaymentRequest;
          setRequests((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          );
          const config = statusConfig[updated.status];
          if (config && updated.status !== 'pending') {
            toast({
              title: isRTL ? "تحديث طلب الدفع" : "Payment Request Update",
              description: isRTL ? config.label : config.labelEn,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("top_up_requests")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setRequests((data as PaymentRequest[]) || []);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted">
            <BackArrow className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{isRTL ? "طلبات الدفع" : "Payment Requests"}</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">{isRTL ? "لا توجد طلبات دفع" : "No payment requests"}</p>
            <button
              onClick={() => navigate("/pricing")}
              className="mt-4 text-primary underline"
            >
              {isRTL ? "تصفح الباقات" : "Browse plans"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const config = statusConfig[req.status] || statusConfig.pending;
              const planLabel = req.plan_type
                ? planLabels[req.plan_type]?.[isRTL ? "ar" : "en"] || customPlanName(req.plan_type, isRTL ? "ar" : "en")
                : isRTL ? "شحن رصيد" : "Top-up";

              return (
                <Card key={req.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">{planLabel}</span>
                          <Badge 
                            variant={config.variant} 
                            className={`gap-1 text-xs ${req.status === 'approved' ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}`}
                          >
                            {config.icon}
                            {isRTL ? config.label : config.labelEn}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{isRTL ? "رقم العملية:" : "Txn #:"} {req.transaction_number}</span>
                          </div>
                          <div>{isRTL ? "المبلغ:" : "Amount:"} {req.amount.toLocaleString()}</div>
                          <div>{formatDate(req.created_at)}</div>
                        </div>

                        {req.admin_note && (
                          <div className="text-sm bg-muted rounded-lg p-2 mt-2">
                            <span className="font-medium">{isRTL ? "ملاحظة:" : "Note:"}</span> {req.admin_note}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MyPaymentRequests;
