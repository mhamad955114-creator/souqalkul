import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useListingSettings } from "@/hooks/useListingSettings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Wallet as WalletIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  SendHorizontal,
  History,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  ImagePlus,
  X,
  Star,
  Crown,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const transactionTypeLabels: Record<string, { label: string; color: string; icon: typeof ArrowUpCircle }> = {
  top_up: { label: "شحن رصيد", color: "text-green-500", icon: ArrowUpCircle },
  payment: { label: "دفع", color: "text-red-500", icon: ArrowDownCircle },
  transfer_in: { label: "تحويل وارد", color: "text-green-500", icon: ArrowUpCircle },
  transfer_out: { label: "تحويل صادر", color: "text-red-500", icon: SendHorizontal },
  promotion: { label: "ترويج إعلان", color: "text-orange-500", icon: ArrowDownCircle },
  package: { label: "شراء باقة", color: "text-blue-500", icon: ArrowDownCircle },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "قيد المراجعة", variant: "secondary", icon: Clock },
  approved: { label: "مقبول", variant: "default", icon: CheckCircle },
  rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
};

const WalletPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { wallet, transactions, topUpRequests, loading, submitTopUp, refetch } = useWallet();
  const { settings, loading: settingsLoading } = useListingSettings();
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpTxNumber, setTopUpTxNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shamcashAccount, setShamcashAccount] = useState("0999999999");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchSubscription = async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setActiveSubscription(data);
    };
    fetchSubscription();
  }, [user, purchasing]);

  useEffect(() => {
    const fetchShamcash = async () => {
      const { data } = await supabase
        .from("listing_settings")
        .select("setting_value")
        .eq("setting_key", "shamcash_account")
        .maybeSingle();
      if (data) {
        setShamcashAccount(String(data.setting_value).replace(/"/g, "") || "0999999999");
      }
    };
    fetchShamcash();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error("أدخل مبلغاً صحيحاً");
      return;
    }
    if (!topUpTxNumber.trim()) {
      toast.error("أدخل رقم العملية");
      return;
    }
    setSubmitting(true);
    try {
      let receiptUrl: string | undefined;

      // Upload receipt if provided
      if (receiptFile && user) {
        const ext = receiptFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, receiptFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("receipts")
          .getPublicUrl(filePath);
        receiptUrl = urlData.publicUrl;
      }

      await submitTopUp(amount, topUpTxNumber.trim(), receiptUrl);
      toast.success("تم إرسال طلب الشحن بنجاح، سيتم مراجعته قريباً");
      setTopUpOpen(false);
      setTopUpAmount("");
      setTopUpTxNumber("");
      setReceiptFile(null);
      setReceiptPreview(null);
    } catch {
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const copyAccount = () => {
    navigator.clipboard.writeText(shamcashAccount);
    toast.success("تم نسخ رقم الحساب");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0" dir={dir}>
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back button */}
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <BackArrow className="h-4 w-4" />
          رجوع
        </Button>

        {/* Balance Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">رصيدك الحالي</p>
                <p className="text-3xl font-bold">{formatPrice(wallet?.balance ?? 0)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setTopUpOpen(true)}
              >
                <ArrowUpCircle className="h-4 w-4" />
                شحن رصيد
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => toast.info("ميزة التحويل قادمة قريباً")}
              >
                <SendHorizontal className="h-4 w-4" />
                تحويل
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="transactions" className="gap-2">
              <History className="h-4 w-4" />
              سجل العمليات
            </TabsTrigger>
            <TabsTrigger value="topups" className="gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              طلبات الشحن
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  لا توجد عمليات بعد
                </CardContent>
              </Card>
            ) : (
              transactions.map((tx) => {
                const config = transactionTypeLabels[tx.type] || {
                  label: tx.type,
                  color: "text-muted-foreground",
                  icon: History,
                };
                const Icon = config.icon;
                const isPositive = ["top_up", "transfer_in"].includes(tx.type);
                return (
                  <Card key={tx.id}>
                    <CardContent className="flex items-center gap-3 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{config.label}</p>
                        {tx.description && (
                          <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                      </div>
                      <div className={`font-bold text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {isPositive ? "+" : "-"}{formatPrice(Math.abs(tx.amount))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="topups" className="mt-4 space-y-3">
            {topUpRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  لا توجد طلبات شحن
                </CardContent>
              </Card>
            ) : (
              topUpRequests.map((req) => {
                const status = statusConfig[req.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <Card key={req.id}>
                    <CardContent className="flex items-center gap-3 py-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-primary">
                        <ArrowUpCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{formatPrice(req.amount)}</p>
                        <p className="text-xs text-muted-foreground">رقم العملية: {req.transaction_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(req.created_at)}</p>
                      </div>
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </CardContent>
                    {req.admin_note && (
                      <div className="px-4 pb-3">
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          ملاحظة: {req.admin_note}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Subscription Plans Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">باقات التعارف (فتح الدردشة)</h2>
          </div>

          {activeSubscription ? (
            <Card className="border-green-300 bg-green-50 dark:bg-green-950/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">لديك اشتراك نشط</p>
                    <p className="text-sm text-muted-foreground">
                      ينتهي في: {formatDate(activeSubscription.expires_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  name: "مميز",
                  planType: "featured",
                  price: settings.featured_listing.price || 50000,
                  duration: settings.featured_listing.duration_days,
                  icon: Star,
                  color: "text-amber-500",
                  bgColor: "bg-amber-50 dark:bg-amber-950/20",
                  borderColor: "border-amber-300",
                },
                {
                  name: "احترافي",
                  planType: "professional",
                  price: settings.professional_listing.price || 100000,
                  duration: settings.professional_listing.duration_days,
                  icon: Crown,
                  color: "text-purple-500",
                  bgColor: "bg-purple-50 dark:bg-purple-950/20",
                  borderColor: "border-purple-300",
                },
              ].map((plan) => (
                <Card key={plan.planType} className={`${plan.borderColor} ${plan.bgColor}`}>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <plan.icon className={`h-5 w-5 ${plan.color}`} />
                      <span className="font-bold">{plan.name}</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                      <span className="text-sm text-muted-foreground"> / {plan.duration} يوم</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ فتح الدردشة في التعارف</li>
                      <li>✓ إعلانات مميزة</li>
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.planType === "featured" ? "default" : "outline"}
                      onClick={() => {
                        if (!user) {
                          toast.error("يرجى تسجيل الدخول أولاً");
                          return;
                        }
                        setSelectedPlan(plan);
                      }}
                    >
                      شراء الباقة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNavigation />

      {/* Purchase Subscription Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>تأكيد شراء الباقة</DialogTitle>
            <DialogDescription>
              هل تريد شراء باقة {selectedPlan?.name}؟
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">سعر الباقة:</span>
                <span className="font-bold text-lg">{formatPrice(selectedPlan.price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">رصيد المحفظة:</span>
                <span className={`font-bold text-lg ${(wallet?.balance || 0) >= selectedPlan.price ? "text-green-600" : "text-red-600"}`}>
                  {formatPrice(wallet?.balance || 0)}
                </span>
              </div>
              {(wallet?.balance || 0) < selectedPlan.price && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 p-3 rounded-lg text-sm text-center">
                  رصيدك غير كافٍ. اشحن محفظتك أولاً
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>إلغاء</Button>
            <Button
              disabled={purchasing || !wallet || (wallet.balance || 0) < (selectedPlan?.price || 0)}
              onClick={async () => {
                if (!selectedPlan || !user) return;
                setPurchasing(true);
                try {
                  const { error: rpcError } = await supabase.rpc("purchase_subscription", {
                    _user_id: user.id,
                    _plan_type: selectedPlan.planType,
                    _price: selectedPlan.price,
                    _duration_days: selectedPlan.duration,
                  });
                  if (rpcError) throw rpcError;
                  toast.success(`تم شراء باقة ${selectedPlan.name} بنجاح! 🎉 الدردشة مفتوحة الآن`);
                  setSelectedPlan(null);
                  refetch();
                } catch (err: any) {
                  if (err.message?.includes("Insufficient balance")) {
                    toast.error("رصيد المحفظة غير كافٍ!");
                  } else {
                    toast.error("فشل في الشراء: " + (err.message || "خطأ"));
                  }
                } finally {
                  setPurchasing(false);
                }
              }}
            >
              {purchasing ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <WalletIcon className="h-4 w-4 ml-2" />}
              تأكيد الشراء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top-up Dialog */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>شحن رصيد عبر شام كاش</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Instructions */}
            <Card className="bg-muted/50">
              <CardContent className="py-4 space-y-2">
                <p className="text-sm font-medium">خطوات الشحن:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>افتح تطبيق شام كاش</li>
                  <li>حوّل المبلغ المطلوب إلى الرقم التالي:</li>
                </ol>
                <div className="flex items-center gap-2 bg-background rounded-lg p-3 border">
                  <span className="font-mono font-bold text-lg flex-1">{shamcashAccount}</span>
                  <Button variant="ghost" size="icon" onClick={copyAccount}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <ol start={3} className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>أدخل المبلغ ورقم العملية أدناه</li>
                  <li>سيتم مراجعة طلبك وإضافة الرصيد خلال دقائق</li>
                </ol>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>المبلغ (ل.س)</Label>
              <Input
                type="number"
                placeholder="مثال: 50000"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>رقم العملية من شام كاش</Label>
              <Input
                placeholder="أدخل رقم العملية"
                value={topUpTxNumber}
                onChange={(e) => setTopUpTxNumber(e.target.value)}
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label>صورة الإيصال (اختياري)</Label>
              {receiptPreview ? (
                <div className="relative">
                  <img
                    src={receiptPreview}
                    alt="إيصال"
                    className="w-full max-h-48 object-contain rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2 h-7 w-7"
                    onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">اضغط لرفع صورة الإيصال</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReceiptChange}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleTopUp} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpCircle className="h-4 w-4" />}
              إرسال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletPage;
