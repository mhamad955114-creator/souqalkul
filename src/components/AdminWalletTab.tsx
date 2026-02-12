import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/lib/constants";

interface TopUpRequest {
  id: string;
  user_id: string;
  amount: number;
  transaction_number: string;
  status: string;
  admin_note: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
  user_email?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "قيد المراجعة", variant: "secondary" },
  approved: { label: "مقبول", variant: "default" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

const AdminWalletTab = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TopUpRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<string>("pending");

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("top_up_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch user emails from profiles
      const userIds = [...new Set(data.map((r: TopUpRequest) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p: { user_id: string; full_name: string | null }) => [p.user_id, p.full_name || "مستخدم"])
      );

      setRequests(
        data.map((r: TopUpRequest) => ({
          ...r,
          user_email: profileMap.get(r.user_id) || r.user_id.slice(0, 8),
        }))
      );
    }
    if (error) toast.error("خطأ في تحميل الطلبات");
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: TopUpRequest) => {
    if (!user) return;
    setProcessing(true);

    try {
      // 1. Update request status
      const { error: updateError } = await supabase
        .from("top_up_requests")
        .update({
          status: "approved",
          admin_note: adminNote || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // 2. Get current wallet balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", request.user_id)
        .single();

      const currentBalance = wallet?.balance ?? 0;
      const newBalance = currentBalance + request.amount;

      // 3. Update wallet balance
      if (wallet) {
        await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("user_id", request.user_id);
      } else {
        await supabase
          .from("wallets")
          .insert({ user_id: request.user_id, balance: request.amount });
      }

      // 4. Create transaction record
      await supabase.from("wallet_transactions").insert({
        user_id: request.user_id,
        type: "top_up",
        amount: request.amount,
        balance_after: newBalance,
        description: `شحن رصيد عبر شام كاش - رقم العملية: ${request.transaction_number}`,
      });

      // 5. Send notification
      await supabase.from("notifications").insert({
        user_id: request.user_id,
        title: "تم شحن محفظتك",
        message: `تم إضافة ${formatPrice(request.amount)} إلى محفظتك بنجاح`,
        type: "wallet",
      });

      toast.success("تم قبول الطلب وإضافة الرصيد بنجاح");
      setSelectedRequest(null);
      setAdminNote("");
      fetchRequests();
    } catch {
      toast.error("حدث خطأ أثناء معالجة الطلب");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request: TopUpRequest) => {
    if (!user) return;
    setProcessing(true);

    try {
      await supabase
        .from("top_up_requests")
        .update({
          status: "rejected",
          admin_note: adminNote || "تم رفض الطلب",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      await supabase.from("notifications").insert({
        user_id: request.user_id,
        title: "تم رفض طلب الشحن",
        message: adminNote || "تم رفض طلب شحن المحفظة. يرجى التواصل مع الدعم.",
        type: "wallet",
      });

      toast.success("تم رفض الطلب");
      setSelectedRequest(null);
      setAdminNote("");
      fetchRequests();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = requests.filter(
    (r) => filter === "all" || r.status === filter
  );

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">قيد المراجعة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {requests.filter((r) => r.status === "approved").length}
            </p>
            <p className="text-sm text-muted-foreground">مقبول</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-red-500">
              {requests.filter((r) => r.status === "rejected").length}
            </p>
            <p className="text-sm text-muted-foreground">مرفوض</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "pending", label: "قيد المراجعة" },
          { value: "approved", label: "مقبول" },
          { value: "rejected", label: "مرفوض" },
          { value: "all", label: "الكل" },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لا توجد طلبات
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>رقم العملية</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => {
                const status = statusConfig[req.status] || statusConfig.pending;
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.user_email}</TableCell>
                    <TableCell>{formatPrice(req.amount)}</TableCell>
                    <TableCell className="font-mono text-sm">{req.transaction_number}</TableCell>
                    <TableCell className="text-sm">{formatDate(req.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {req.status === "pending" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setAdminNote("");
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          مراجعة
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">تمت المراجعة</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>مراجعة طلب الشحن</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">المستخدم</p>
                  <p className="font-medium">{selectedRequest.user_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المبلغ</p>
                  <p className="font-bold text-lg">{formatPrice(selectedRequest.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">رقم العملية</p>
                  <p className="font-mono">{selectedRequest.transaction_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">التاريخ</p>
                  <p>{formatDate(selectedRequest.created_at)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظة (اختياري)</label>
                <Textarea
                  placeholder="أضف ملاحظة..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedRequest)}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  رفض
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  قبول وإضافة الرصيد
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWalletTab;
