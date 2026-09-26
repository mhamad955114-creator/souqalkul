import { attachPhones } from "@/lib/profilePhones";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CalendarClock, Search, MessageCircle, BellRing, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { notifyUser } from "@/lib/notifyAdmins";
import { buildWhatsAppUrl } from "@/hooks/useContactSettings";

interface SubRow {
  id: string;
  user_id: string;
  plan_type: string;
  starts_at: string;
  expires_at: string;
  status: string;
  full_name: string | null;
  phone: string | null;
}

const planLabels: Record<string, string> = {
  featured: "مميز ⭐",
  professional: "احترافي 👑",
  business: "رجال أعمال 💎",
};

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(iso),
  );

const daysLeft = (iso: string) =>
  Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const AdminSubscriptionsTab = () => {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notifying, setNotifying] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { data: subs, error } = await supabase
        .from("user_subscriptions")
        .select("id, user_id, plan_type, starts_at, expires_at, status")
        .order("expires_at", { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((subs || []).map((s) => s.user_id))];
      const { data: profiles } = userIds.length
        ? { data: await attachPhones((await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds)).data) }
        : { data: [] as { user_id: string; full_name: string | null; phone: string | null }[] };

      const byUser = new Map((profiles || []).map((p) => [p.user_id, p]));

      setRows(
        (subs || []).map((s) => ({
          ...s,
          full_name: byUser.get(s.user_id)?.full_name ?? null,
          phone: byUser.get(s.user_id)?.phone ?? null,
        })),
      );
    } catch {
      toast.error("تعذر تحميل تقويم الباقات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.full_name || "").toLowerCase().includes(q) ||
        (r.phone || "").includes(q) ||
        (planLabels[r.plan_type] || r.plan_type).includes(q),
    );
  }, [rows, search]);

  const active = filtered.filter((r) => r.status === "active" && daysLeft(r.expires_at) > 0);
  const expiringSoon = active.filter((r) => daysLeft(r.expires_at) <= 7);
  const expired = filtered.filter((r) => r.status !== "active" || daysLeft(r.expires_at) <= 0);

  const sendReminder = async (row: SubRow) => {
    setNotifying(row.id);
    const left = daysLeft(row.expires_at);
    try {
      await notifyUser(row.user_id, {
        title: left > 0 ? "باقتك على وشك الانتهاء" : "انتهت باقتك",
        message:
          left > 0
            ? `باقة ${planLabels[row.plan_type] || row.plan_type} تنتهي بتاريخ ${formatDay(row.expires_at)} (بعد ${left} يوم). جدّدها للحفاظ على المزايا.`
            : `باقة ${planLabels[row.plan_type] || row.plan_type} انتهت بتاريخ ${formatDay(row.expires_at)}. يمكنك تجديدها الآن.`,
        type: "subscription_expiry_reminder",
        relatedId: row.id,
      });
      toast.success("تم إرسال التنبيه للمستخدم");
    } catch {
      toast.error("تعذر إرسال التنبيه");
    } finally {
      setNotifying(null);
    }
  };

  const renderTable = (list: SubRow[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">المستخدم</TableHead>
            <TableHead className="text-start">الباقة</TableHead>
            <TableHead className="text-start">تبدأ</TableHead>
            <TableHead className="text-start">تنتهي</TableHead>
            <TableHead className="text-start">المتبقي</TableHead>
            <TableHead className="text-start">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((row) => {
            const left = daysLeft(row.expires_at);
            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {row.full_name || "بدون اسم"}
                  {row.phone ? (
                    <span className="block text-xs text-muted-foreground" dir="ltr">
                      {row.phone}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>{planLabels[row.plan_type] || row.plan_type}</TableCell>
                <TableCell dir="ltr">{formatDay(row.starts_at)}</TableCell>
                <TableCell dir="ltr">{formatDay(row.expires_at)}</TableCell>
                <TableCell>
                  {left <= 0 ? (
                    <Badge variant="destructive">منتهية</Badge>
                  ) : left <= 7 ? (
                    <Badge className="bg-amber-500 hover:bg-amber-500">{left} يوم</Badge>
                  ) : (
                    <Badge variant="secondary">{left} يوم</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendReminder(row)}
                      disabled={notifying === row.id}
                    >
                      {notifying === row.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BellRing className="h-4 w-4" />
                      )}
                      تنبيه
                    </Button>
                    {row.phone ? (
                      <Button size="sm" variant="ghost" asChild>
                        <a
                          href={buildWhatsAppUrl(
                            row.phone,
                            `تنبيه: باقة ${planLabels[row.plan_type] || row.plan_type} تنتهي بتاريخ ${formatDay(row.expires_at)}`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4" />
                          واتساب
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {list.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                لا توجد بيانات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الهاتف أو الباقة"
            className="ps-9"
          />
        </div>
        <Button variant="outline" onClick={fetchRows}>
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">باقات فعّالة</p>
              <p className="text-xl font-bold">{active.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">تنتهي خلال 7 أيام</p>
              <p className="text-xl font-bold">{expiringSoon.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">منتهية</p>
              <p className="text-xl font-bold">{expired.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {expiringSoon.length > 0 && (
        <Card className="border-amber-300">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              تنبيه: باقات على وشك الانتهاء
            </h3>
            {renderTable(expiringSoon)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-bold">تقويم الباقات الفعّالة</h3>
          {renderTable(active)}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-bold">باقات منتهية</h3>
          {renderTable(expired)}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptionsTab;
