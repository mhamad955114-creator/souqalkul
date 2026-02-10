import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminRole } from "@/hooks/useAdminRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Eye, ExternalLink, Shield, Trash2, Users, FileText, Flag, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/constants";

interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  listing_title?: string;
  reporter_name?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "قيد المراجعة", variant: "outline" },
  reviewed: { label: "تمت المراجعة", variant: "secondary" },
  resolved: { label: "تم الحل", variant: "default" },
  dismissed: { label: "مرفوض", variant: "destructive" },
};

const AdminReports = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState(false);

  // General stats
  const [stats, setStats] = useState({ listings: 0, users: 0, reports: 0, views: 0 });
  const [dailyListings, setDailyListings] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("ليس لديك صلاحية الوصول لهذه الصفحة");
      navigate("/");
    }
  }, [roleLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchStats = async () => {
      const [listingsRes, profilesRes, reportsRes, viewsRes] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("views_count"),
      ]);
      const totalViews = viewsRes.data?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0;
      setStats({
        listings: listingsRes.count || 0,
        users: profilesRes.count || 0,
        reports: reportsRes.count || 0,
        views: totalViews,
      });

      // Fetch daily listings for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: dailyData } = await supabase
        .from("listings")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (dailyData) {
        const countByDay: Record<string, number> = {};
        // Initialize all 30 days
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          countByDay[key] = 0;
        }
        dailyData.forEach((item) => {
          const key = item.created_at.split("T")[0];
          if (countByDay[key] !== undefined) countByDay[key]++;
        });
        setDailyListings(
          Object.entries(countByDay).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString("ar-SY", { month: "short", day: "numeric" }),
            count,
          }))
        );
      }
    };
    fetchStats();
  }, [isAdmin]);

  const fetchReports = async () => {
    setLoading(true);

    let query = supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("فشل تحميل البلاغات");
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setReports([]);
      setLoading(false);
      return;
    }

    // Fetch listing titles and reporter names
    const listingIds = [...new Set(data.map((r) => r.listing_id))];
    const reporterIds = [...new Set(data.map((r) => r.reporter_id))];

    const [listingsRes, profilesRes] = await Promise.all([
      supabase.from("listings").select("id, title").in("id", listingIds),
      supabase.from("profiles").select("user_id, full_name").in("user_id", reporterIds),
    ]);

    const listingMap = new Map(listingsRes.data?.map((l) => [l.id, l.title]) || []);
    const profileMap = new Map(profilesRes.data?.map((p) => [p.user_id, p.full_name]) || []);

    const enriched: Report[] = data.map((r) => ({
      ...r,
      listing_title: listingMap.get(r.listing_id) || "إعلان محذوف",
      reporter_name: profileMap.get(r.reporter_id) || "مستخدم",
    }));

    setReports(enriched);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchReports();
  }, [isAdmin, statusFilter]);

  const updateStatus = async (reportId: string, newStatus: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", reportId);

    if (error) {
      toast.error("فشل تحديث حالة البلاغ");
      return;
    }

    toast.success("تم تحديث حالة البلاغ");
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const deleteListing = async (report: Report) => {
    setDeleting(true);
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", report.listing_id);

    if (error) {
      toast.error("فشل حذف الإعلان");
      setDeleting(false);
      return;
    }

    // Update report status to resolved
    await supabase
      .from("reports")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("listing_id", report.listing_id);

    toast.success("تم حذف الإعلان وتحديث البلاغات المرتبطة");
    setDeleting(false);
    setDeleteTarget(null);
    setSelectedReport(null);
    fetchReports();
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">إحصائيات عامة وإدارة البلاغات</p>
          </div>
        </div>

        {/* General Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.listings}</p>
                <p className="text-sm text-muted-foreground">إعلان نشط</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.users}</p>
                <p className="text-sm text-muted-foreground">مستخدم مسجّل</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Flag className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.reports}</p>
                <p className="text-sm text-muted-foreground">بلاغ مقدّم</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.views.toLocaleString("ar-SY")}</p>
                <p className="text-sm text-muted-foreground">مشاهدة إجمالية</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Listings Chart */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">الإعلانات المضافة يومياً (آخر 30 يوم)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyListings}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    interval={Math.floor(dailyListings.length / 8)}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{ fontWeight: "bold", marginBottom: 4 }}
                  />
                  <Bar dataKey="count" name="عدد الإعلانات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Report Status Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = reports.filter((r) => r.status === key).length;
            return (
              <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(key)}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{statusFilter === "all" ? count : key === statusFilter ? reports.length : "—"}</p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="فلترة حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع البلاغات</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{reports.length} بلاغ</p>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">لا توجد بلاغات</p>
              <p className="text-muted-foreground">لا توجد بلاغات مطابقة للفلتر الحالي</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الإعلان</TableHead>
                    <TableHead className="text-right">المُبلّغ</TableHead>
                    <TableHead className="text-right">السبب</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {report.listing_title}
                      </TableCell>
                      <TableCell>{report.reporter_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[report.status]?.variant || "outline"}>
                          {statusConfig[report.status]?.label || report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedReport(report)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/listing/${report.listing_id}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {report.listing_title !== "إعلان محذوف" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(report)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </main>

      <Footer />

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل البلاغ</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">الإعلان</p>
                <p className="font-medium">{selectedReport.listing_title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المُبلّغ</p>
                <p className="font-medium">{selectedReport.reporter_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">السبب</p>
                <p className="font-medium">{selectedReport.reason}</p>
              </div>
              {selectedReport.details && (
                <div>
                  <p className="text-sm text-muted-foreground">التفاصيل</p>
                  <p className="text-foreground whitespace-pre-wrap">{selectedReport.details}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">التاريخ</p>
                <p className="font-medium">{formatDate(selectedReport.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">تغيير الحالة</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={selectedReport.status === key ? "default" : "outline"}
                      onClick={() => updateStatus(selectedReport.id, key)}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.open(`/listing/${selectedReport.listing_id}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4 ml-2" />
                عرض الإعلان
              </Button>
              {selectedReport.listing_title !== "إعلان محذوف" && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setDeleteTarget(selectedReport)}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف الإعلان المخالف
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الإعلان</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الإعلان "{deleteTarget?.listing_title}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteListing(deleteTarget)}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حذف الإعلان
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReports;
