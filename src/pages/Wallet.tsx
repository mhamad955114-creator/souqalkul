import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useLanguage } from "@/contexts/LanguageContext";
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
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/lib/constants";

const SHAMCASH_ACCOUNT = "0999999999"; // Replace with actual ShamCash account number

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
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpTxNumber, setTopUpTxNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      await submitTopUp(amount, topUpTxNumber.trim());
      toast.success("تم إرسال طلب الشحن بنجاح، سيتم مراجعته قريباً");
      setTopUpOpen(false);
      setTopUpAmount("");
      setTopUpTxNumber("");
    } catch {
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  const copyAccount = () => {
    navigator.clipboard.writeText(SHAMCASH_ACCOUNT);
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
      </main>
      <Footer />
      <BottomNavigation />

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
                  <span className="font-mono font-bold text-lg flex-1">{SHAMCASH_ACCOUNT}</span>
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
