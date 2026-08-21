import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/constants";

interface UpgradeRequest {
  id: string;
  user_id: string;
  amount: number;
  transaction_number: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  plan_type: string | null;
  duration_days: number | null;
  user_name?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "قيد المراجعة", variant: "secondary" },
  approved: { label: "مقبول", variant: "default" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

const planNames: Record<string, string> = {
  featured: "مميزة ⭐",
  professional: "احترافية 👑",
  business: "رجال أعمال 💎",
};

const AdminUpgradeRequestsTab = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UpgradeRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<string>("pending");

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("top_up_requests")
      .select("id, user_id, amount, transaction_number, status, admin_note, created_at, plan_type, duration_days")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      toast.error("خطأ في تحميل طلبات الترقية");
      setLoading(false);
      return;
    }

    const rows = (data || []) as UpgradeRequest[];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    let profileMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.full_name || "بدون اسم"])
      );
    }

    setRequests(
      rows.map((r) => ({
        ...r,
        user_name: profileMap.get(r.user_id) || r.user_id.slice(0, 8),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("admin-upgrade-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "top_up_requests" },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (request: UpgradeRequest) => {
    if (!user) return;
    setProcessing(true);
    try {
      const { error } = await supabase.rpc("admin_approve_subscription_request", {
        _request_id: request.id,
        _admin_note: adminNote || null,
      });
      if (error) throw error;
      toast.success("تم قبول الطلب وتفعيل الباقة");
      setSelected(null);
      setAdminNote("");
      fetchRequests();
    } catch {
      toast.error("حدث خطأ أثناء معالجة الطلب");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request: UpgradeRequest) => {
    if (!user) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("top_up_requests")
        .update({
          status: "rejected",
          admin_note: adminNote || "تم رفض الطلب",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id);
      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: request.user_id,
        title: "تم رفض طلب الترقية",
        message: adminNote || "تم رفض طلب الترقية. يرجى التواصل مع الدعم.",
        type: "system",
      });

      toast.success("تم رفض الطلب");
      setSelected(null);
      setAdminNote("");
      fetchRequests();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">قيد المراجعة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {requests.filter((r) => r.status === "approved").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">مقبول</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-red-500">
              {requests.filter((r) => r.status === "rejected").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">مرفوض</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto">
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
            className="shrink-0"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لا توجد طلبات ترقية
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">الباقة</TableHead>
                <TableHead className="text-right">المدة</TableHead>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => {
                const status = statusConfig[req.status] || statusConfig.pending;
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.user_name}</TableCell>
                    <TableCell>
                      {req.plan_type ? planNames[req.plan_type] || req.plan_type : "—"}
                    </TableCell>
                    <TableCell>{req.duration_days ? `${req.duration_days} يوم` : "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{req.transaction_number}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{formatDate(req.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {req.status === "pending" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setSelected(req);
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

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>مراجعة طلب الترقية</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">المستخدم</p>
                  <p className="font-medium">{selected.user_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">الباقة</p>
                  <p className="font-medium">
                    {selected.plan_type ? planNames[selected.plan_type] || selected.plan_type : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">المدة</p>
                  <p className="font-medium">
                    {selected.duration_days ? `${selected.duration_days} يوم` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">رقم الطلب</p>
                  <p className="font-mono text-xs">{selected.transaction_number}</p>
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
                  onClick={() => handleReject(selected)}
                  disabled={processing}
                  className="gap-1"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  رفض
                </Button>
                <Button onClick={() => handleApprove(selected)} disabled={processing} className="gap-1">
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  قبول وتفعيل
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUpgradeRequestsTab;
