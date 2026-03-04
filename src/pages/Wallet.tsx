import { useState, useEffect, useRef, useCallback } from "react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
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
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
  Share2,
  Receipt,
  User,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
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

// Component to show sender/receiver info
const RelatedUserInfo = ({ userId, type }: { userId: string; type: string }) => {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setName(data.full_name);
      });
  }, [userId]);

  const label = type === "transfer_in" ? "من:" : type === "transfer_out" ? "إلى:" : "";
  if (!label) return null;

  return (
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      <span>{label}</span>
      <span className="font-medium text-foreground">{name || userId.slice(0, 8)}</span>
    </p>
  );
};

const WalletPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { wallet, transactions, topUpRequests, loading, submitTopUp, lookupReceiverByWalletId, executeTransfer, refetch } = useWallet();
  const { settings, rawSettings, loading: settingsLoading } = useListingSettings();
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpTxNumber, setTopUpTxNumber] = useState("");
  const [transferWalletId, setTransferWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState<{ userId: string; name: string } | null>(null);
  const [pendingAmount, setPendingAmount] = useState(0);

  // QR Scanner state
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  // QR state
  const [qrOpen, setQrOpen] = useState(false);

  // Balance pulse animation on change
  const [balancePulse, setBalancePulse] = useState(false);
  const prevBalanceRef = useRef<number | null>(null);

  useEffect(() => {
    if (wallet && prevBalanceRef.current !== null && wallet.balance !== prevBalanceRef.current) {
      setBalancePulse(true);
      const timer = setTimeout(() => setBalancePulse(false), 1200);
      return () => clearTimeout(timer);
    }
    if (wallet) prevBalanceRef.current = wallet.balance;
  }, [wallet?.balance]);

  // Realtime subscription for wallet changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('wallet-balance')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` },
        () => { refetch(); }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${user.id}` },
        () => { refetch(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refetch]);

  // Receipt state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    invoiceNumber: string;
    receiverName: string;
    receiverWalletId: string;
    amount: number;
    date: string;
    senderName: string;
    senderWalletId: string;
  } | null>(null);

  const shamcashAccount = rawSettings.shamcash_account
    ? String(rawSettings.shamcash_account).replace(/"/g, "")
    : "0999999999";

  // QR Scanner effect
  const onScanSuccess = useCallback((decodedText: string) => {
    setTransferWalletId(decodedText.trim());
    setScanning(false);
    toast.success("تم مسح رمز QR بنجاح");
  }, []);

  useEffect(() => {
    if (!scanning) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    let cancelled = false;
    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      ).catch(() => {
        toast.error("تعذر الوصول إلى الكاميرا");
        setScanning(false);
      });
    });

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scanning, onScanSuccess]);

// Animated balance display component
const AnimatedBalance = ({ balance }: { balance: number }) => {
  const animatedValue = useAnimatedCounter(balance);
  return (
    <p className="text-4xl font-extrabold tracking-tight transition-all duration-300">
      {formatPrice(Math.round(animatedValue))}
    </p>
  );
};


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
    toast.success("تم نسخ عنوان المحفظة");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0" dir={dir}>
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back button */}
        <Button variant="ghost" className="mb-4 animate-fade-in" onClick={() => navigate(-1)}>
          <BackArrow className="h-4 w-4" />
          رجوع
        </Button>

        {/* Balance Card */}
        <Card className={`mb-6 overflow-hidden animate-scale-in shadow-xl transition-all duration-300 ${balancePulse ? 'animate-balance-pulse ring-2 ring-accent/50' : ''}`}>
          <div className="bg-gradient-to-br from-primary via-primary/90 to-accent p-6 text-primary-foreground relative transition-all duration-500">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110">
                  <WalletIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">رصيدك الحالي</p>
                  <AnimatedBalance balance={wallet?.balance ?? 0} />
                </div>
              </div>
              {/* Wallet Address */}
              {user && (
                <div className="mb-4 flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-xs border border-primary-foreground/10 transition-all duration-300 hover:bg-primary-foreground/15">
                  <span className="opacity-70">عنوان محفظتك:</span>
                  <span className="font-mono flex-1 truncate">{user.id.slice(0, 8)}...{user.id.slice(-4)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-lg transition-transform duration-200 hover:scale-110"
                    onClick={() => setQrOpen(true)}
                    title="عرض رمز QR"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="20" y="14" width="1" height="3"/><rect x="14" y="20" width="3" height="1"/><rect x="20" y="20" width="1" height="1"/></svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-lg transition-transform duration-200 hover:scale-110"
                    onClick={() => {
                      navigator.clipboard.writeText(user.id);
                      toast.success("تم نسخ عنوان المحفظة");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => setTopUpOpen(true)}
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  شحن رصيد
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => setTransferOpen(true)}
                >
                  <SendHorizontal className="h-4 w-4" />
                  تحويل
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="w-full animate-fade-in" style={{ animationDelay: "150ms" }}>
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
              transactions.map((tx, idx) => {
                const config = transactionTypeLabels[tx.type] || {
                  label: tx.type,
                  color: "text-muted-foreground",
                  icon: History,
                };
                const Icon = config.icon;
                const isPositive = ["top_up", "transfer_in"].includes(tx.type);
                return (
                  <Card key={tx.id} className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" style={{ animationDelay: `${idx * 50}ms` }}>
                    <CardContent className="flex items-center gap-3 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{config.label}</p>
                        {tx.description && (
                          <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                        )}
                        {tx.related_user_id && (
                          <RelatedUserInfo userId={tx.related_user_id} type={tx.type} />
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


      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm" dir={dir}>
          <DialogHeader>
            <DialogTitle>رمز QR للمحفظة</DialogTitle>
            <DialogDescription>امسح هذا الرمز لاستلام تحويلات</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG
                value={user?.id || ""}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">عنوان المحفظة</p>
              <p className="font-mono text-sm select-all break-all">{user?.id}</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(user?.id || "");
                toast.success("تم نسخ عنوان المحفظة");
              }}
            >
              <Copy className="h-4 w-4" />
              نسخ العنوان
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (typeof navigator.share === "function") {
                  navigator.share({
                    title: "عنوان محفظتي",
                    text: `عنوان محفظتي في سوق الكل: ${user?.id}`,
                  });
                } else {
                  navigator.clipboard.writeText(user?.id || "");
                  toast.success("تم نسخ عنوان المحفظة");
                }
              }}
            >
              <Share2 className="h-4 w-4" />
              مشاركة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top-up Dialog */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>شحن رصيد</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Instructions */}
            <Card className="bg-muted/50">
              <CardContent className="py-4 space-y-2">
                <p className="text-sm font-medium">خطوات الشحن:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>حوّل المبلغ المطلوب إلى عنوان المحفظة التالي:</li>
                </ol>
                <div className="flex items-center gap-2 bg-background rounded-lg p-3 border">
                  <span className="font-mono font-bold text-sm flex-1 truncate" dir="ltr">{shamcashAccount}</span>
                  <Button variant="ghost" size="icon" onClick={copyAccount}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <ol start={2} className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
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

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>تحويل رصيد</DialogTitle>
            <DialogDescription>أدخل عنوان محفظة المستلم</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="py-3">
                <p className="text-sm text-muted-foreground">
                  رصيدك الحالي: <span className="font-bold text-foreground">{formatPrice(wallet?.balance ?? 0)}</span>
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>عنوان محفظة المستلم</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="الصق عنوان المحفظة هنا"
                  value={transferWalletId}
                  onChange={(e) => setTransferWalletId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setScanning((prev) => !prev)}
                  title="مسح رمز QR"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              {scanning && (
                <div className="rounded-lg overflow-hidden border">
                  <div id="qr-reader" className="w-full" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>المبلغ (ل.س)</Label>
              <Input
                type="number"
                placeholder="أدخل المبلغ"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={async () => {
                const amount = parseFloat(transferAmount);
                if (!transferWalletId.trim()) {
                  toast.error("أدخل عنوان محفظة المستلم");
                  return;
                }
                if (!amount || amount <= 0) {
                  toast.error("أدخل مبلغاً صحيحاً");
                  return;
                }
                setSubmitting(true);
                try {
                  const receiver = await lookupReceiverByWalletId(transferWalletId.trim());
                  setReceiverInfo({ userId: receiver.userId, name: receiver.name });
                  setPendingAmount(amount);
                  setTransferOpen(false);
                  setConfirmOpen(true);
                } catch (err: any) {
                  toast.error(err.message || "حدث خطأ");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
              متابعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد التحويل</AlertDialogTitle>
            <AlertDialogDescription>
              يرجى التحقق من بيانات المستلم قبل إتمام التحويل
            </AlertDialogDescription>
          </AlertDialogHeader>

          {receiverInfo && (
            <div className="space-y-3 my-2">
              <Card className="border-primary/20">
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">اسم المستلم</p>
                      <p className="font-bold">{receiverInfo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">عنوان المحفظة</span>
                    <span className="font-mono text-xs">{receiverInfo.userId.slice(0, 8)}...{receiverInfo.userId.slice(-4)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">المبلغ</span>
                    <span className="font-bold text-primary text-lg">{formatPrice(pendingAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setConfirmOpen(false);
              setTransferOpen(true);
            }}>
              رجوع
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!receiverInfo) return;
                setSubmitting(true);
                try {
                  await executeTransfer(receiverInfo.userId, pendingAmount);
                  const invoiceNum = `INV-${Date.now().toString(36).toUpperCase()}`;
                  const senderProfile = user ? await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("user_id", user.id)
                    .maybeSingle() : null;

                  setReceiptData({
                    invoiceNumber: invoiceNum,
                    receiverName: receiverInfo.name,
                    receiverWalletId: receiverInfo.userId,
                    amount: pendingAmount,
                    date: new Date().toLocaleString("ar-SY"),
                    senderName: senderProfile?.data?.full_name || "أنت",
                    senderWalletId: user?.id || "",
                  });
                  setConfirmOpen(false);
                  setReceiptDialogOpen(true);
                  setTransferWalletId("");
                  setTransferAmount("");
                } catch (err: any) {
                  toast.error(err.message || "حدث خطأ أثناء التحويل");
                  setConfirmOpen(false);
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              تأكيد التحويل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              فاتورة التحويل
            </DialogTitle>
          </DialogHeader>

          {receiptData && (
            <div className="space-y-4">
              <div className="text-center space-y-1 py-2">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-lg font-bold text-green-600">تم التحويل بنجاح</p>
              </div>

              <Card>
                <CardContent className="py-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">رقم الفاتورة</span>
                    <span className="font-mono font-bold text-primary">{receiptData.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">التاريخ</span>
                    <span>{receiptData.date}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">المبلغ</span>
                    <span className="font-bold text-lg">{formatPrice(receiptData.amount)}</span>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <p className="font-semibold text-xs text-muted-foreground">المُرسل</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الاسم</span>
                      <span>{receiptData.senderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المحفظة</span>
                      <span className="font-mono text-xs">{receiptData.senderWalletId.slice(0, 8)}...{receiptData.senderWalletId.slice(-4)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <p className="font-semibold text-xs text-muted-foreground">المُستلم</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الاسم</span>
                      <span>{receiptData.receiverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المحفظة</span>
                      <span className="font-mono text-xs">{receiptData.receiverWalletId.slice(0, 8)}...{receiptData.receiverWalletId.slice(-4)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const text = [
                      `فاتورة تحويل رقم: ${receiptData.invoiceNumber}`,
                      `التاريخ: ${receiptData.date}`,
                      `المبلغ: ${formatPrice(receiptData.amount)}`,
                      `المرسل: ${receiptData.senderName}`,
                      `المستلم: ${receiptData.receiverName}`,
                      `محفظة المستلم: ${receiptData.receiverWalletId.slice(0, 8)}...${receiptData.receiverWalletId.slice(-4)}`,
                      `محفظة المستلم: ${receiptData.receiverWalletId.slice(0, 8)}...${receiptData.receiverWalletId.slice(-4)}`,
                    ].filter(Boolean).join("\n");
                    navigator.clipboard.writeText(text);
                    toast.success("تم نسخ الفاتورة");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  نسخ
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    const text = [
                      `✅ فاتورة تحويل رقم: ${receiptData.invoiceNumber}`,
                      `📅 التاريخ: ${receiptData.date}`,
                      `💰 المبلغ: ${formatPrice(receiptData.amount)}`,
                      `👤 المرسل: ${receiptData.senderName}`,
                      `👤 المستلم: ${receiptData.receiverName}`,
                      `💼 محفظة المستلم: ${receiptData.receiverWalletId.slice(0, 8)}...${receiptData.receiverWalletId.slice(-4)}`,
                    ].filter(Boolean).join("\n");

                    if (navigator.share) {
                      navigator.share({ title: "فاتورة تحويل", text });
                    } else {
                      navigator.clipboard.writeText(text);
                      toast.success("تم نسخ الفاتورة للمشاركة");
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  مشاركة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletPage;
