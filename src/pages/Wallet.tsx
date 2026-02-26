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
  const { wallet, transactions, topUpRequests, loading, submitTopUp, transferBalance, transferByWalletId, lookupReceiverByPhone, lookupReceiverByWalletId, executeTransfer, refetch } = useWallet();
  const { settings, rawSettings, loading: settingsLoading } = useListingSettings();
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpTxNumber, setTopUpTxNumber] = useState("");
  const [transferPhone, setTransferPhone] = useState("");
  const [transferWalletId, setTransferWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState<{ userId: string; name: string; phone: string } | null>(null);
  const [pendingAmount, setPendingAmount] = useState(0);

  // Receipt state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    invoiceNumber: string;
    receiverName: string;
    receiverPhone: string;
    receiverWalletId: string;
    amount: number;
    date: string;
    senderName: string;
    senderWalletId: string;
  } | null>(null);

  const shamcashAccount = rawSettings.shamcash_account
    ? String(rawSettings.shamcash_account).replace(/"/g, "")
    : "0999999999";


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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">رصيدك الحالي</p>
                <p className="text-3xl font-bold">{formatPrice(wallet?.balance ?? 0)}</p>
              </div>
            </div>
            {/* Wallet Address */}
            {user && (
              <div className="mb-4 flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2 text-xs">
                <span className="opacity-70">عنوان محفظتك:</span>
                <span className="font-mono flex-1 truncate">{user.id.slice(0, 8)}...{user.id.slice(-4)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => {
                    navigator.clipboard.writeText(user.id);
                    toast.success("تم نسخ عنوان المحفظة");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
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
                onClick={() => setTransferOpen(true)}
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

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>تحويل رصيد</DialogTitle>
            <DialogDescription>أدخل رقم هاتف المستلم أو عنوان محفظته</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="py-3">
                <p className="text-sm text-muted-foreground">
                  رصيدك الحالي: <span className="font-bold text-foreground">{formatPrice(wallet?.balance ?? 0)}</span>
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="phone">رقم الهاتف</TabsTrigger>
                <TabsTrigger value="wallet_id">عنوان المحفظة</TabsTrigger>
              </TabsList>
              <TabsContent value="phone" className="mt-3 space-y-2">
                <Label>رقم هاتف المستلم</Label>
                <Input
                  type="tel"
                  placeholder="مثال: 09XXXXXXXX"
                  value={transferPhone}
                  onChange={(e) => { setTransferPhone(e.target.value); setTransferWalletId(""); }}
                />
              </TabsContent>
              <TabsContent value="wallet_id" className="mt-3 space-y-2">
                <Label>عنوان محفظة المستلم</Label>
                <Input
                  type="text"
                  placeholder="الصق عنوان المحفظة هنا"
                  value={transferWalletId}
                  onChange={(e) => { setTransferWalletId(e.target.value); setTransferPhone(""); }}
                />
              </TabsContent>
            </Tabs>

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
                const hasPhone = transferPhone.trim().length > 0;
                const hasWalletId = transferWalletId.trim().length > 0;
                if (!hasPhone && !hasWalletId) {
                  toast.error("أدخل رقم هاتف المستلم أو عنوان محفظته");
                  return;
                }
                if (!amount || amount <= 0) {
                  toast.error("أدخل مبلغاً صحيحاً");
                  return;
                }
                setSubmitting(true);
                try {
                  let receiver;
                  if (hasPhone) {
                    receiver = await lookupReceiverByPhone(transferPhone.trim());
                  } else {
                    receiver = await lookupReceiverByWalletId(transferWalletId.trim());
                  }
                  setReceiverInfo(receiver);
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
                  {receiverInfo.phone && (
                    <div className="flex items-center justify-between text-sm border-t pt-2">
                      <span className="text-muted-foreground">رقم الهاتف</span>
                      <span className="font-mono">{receiverInfo.phone}</span>
                    </div>
                  )}
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
                    receiverPhone: receiverInfo.phone,
                    receiverWalletId: receiverInfo.userId,
                    amount: pendingAmount,
                    date: new Date().toLocaleString("ar-SY"),
                    senderName: senderProfile?.data?.full_name || "أنت",
                    senderWalletId: user?.id || "",
                  });
                  setConfirmOpen(false);
                  setReceiptDialogOpen(true);
                  setTransferPhone("");
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
                    {receiptData.receiverPhone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الهاتف</span>
                        <span className="font-mono">{receiptData.receiverPhone}</span>
                      </div>
                    )}
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
                      receiptData.receiverPhone ? `هاتف المستلم: ${receiptData.receiverPhone}` : "",
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
                      receiptData.receiverPhone ? `📱 هاتف المستلم: ${receiptData.receiverPhone}` : "",
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
