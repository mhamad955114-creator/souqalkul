import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useAdminRole } from "@/hooks/useAdminRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Loader2, Eye, ExternalLink, Shield, Trash2, Users, FileText, Flag, TrendingUp, Download, Mail, CheckCircle, Settings, BadgeCheck, Bell, CreditCard, LayoutList, HardDrive, Globe, Layers, Star, CalendarClock } from "lucide-react";
import AdminSettingsTab from "@/components/AdminSettingsTab";

import AdminVerificationTab from "@/components/AdminVerificationTab";
import AdminUpgradeRequestsTab from "@/components/AdminUpgradeRequestsTab";
import AdminListingsTab from "@/components/AdminListingsTab";
import AdminStorageStats from "@/components/AdminStorageStats";
import AdminCountriesTab from "@/components/AdminCountriesTab";
import AdminUsersTab from "@/components/AdminUsersTab";
import AdminCategoriesTab from "@/components/AdminCategoriesTab";
import AdminSubscriptionsTab from "@/components/AdminSubscriptionsTab";
import AdminRewardsTab from "@/components/AdminRewardsTab";
import AdminBadgeGlowTab from "@/components/AdminBadgeGlowTab";
import AdminTopDurationCard from "@/components/AdminTopDurationCard";
import AdminPlansTab from "@/components/AdminPlansTab";
import { Gift, Sparkles as SparklesIcon } from "lucide-react";

import { toast } from "sonner";
import { formatDate, categoryLabels } from "@/lib/constants";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(217, 91%, 60%)",
  "hsl(330, 81%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(263, 70%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(160, 84%, 39%)",
  "hsl(280, 65%, 60%)",
];

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

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<"reports" | "messages" | "settings" | "verification" | "listings" | "storage" | "countries" | "users" | "categories" | "upgrades" | "subscriptions" | "rewards" | "glow" | "plans">("reports");
  const [searchParams] = useSearchParams();
  useEffect(() => { const t = searchParams.get("tab"); if (t) setActiveTab(t as any); }, [searchParams]);

  // Contact messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteMessageTarget, setDeleteMessageTarget] = useState<ContactMessage | null>(null);

  // General stats
  const [stats, setStats] = useState({ listings: 0, users: 0, reports: 0, views: 0, pushSubscribers: 0 });
  const [dailyListings, setDailyListings] = useState<{ date: string; count: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("ليس لديك صلاحية الوصول لهذه الصفحة");
      navigate("/");
    }
  }, [roleLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchStats = async () => {
      const [listingsRes, profilesRes, reportsRes, viewsRes, pushRes] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("views_count"),
        supabase.from("push_subscriptions").select("user_id"),
      ]);
      const totalViews = viewsRes.data?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0;
      const uniquePushUsers = new Set(pushRes.data?.map(s => s.user_id) || []).size;
      setStats({
        listings: listingsRes.count || 0,
        users: profilesRes.count || 0,
        reports: reportsRes.count || 0,
        views: totalViews,
        pushSubscribers: uniquePushUsers,
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

      // Fetch category distribution
      const { data: catData } = await supabase
        .from("listings")
        .select("category")
        .eq("status", "active");

      if (catData) {
        const catMap: Record<string, number> = {};
        catData.forEach((item) => {
          catMap[item.category] = (catMap[item.category] || 0) + 1;
        });
        setCategoryData(
          Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
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

  // Fetch contact messages
  const fetchContactMessages = async () => {
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setContactMessages(data as ContactMessage[]);
    }
    setMessagesLoading(false);
  };

  useEffect(() => {
    if (isAdmin && activeTab === "messages") fetchContactMessages();
  }, [isAdmin, activeTab]);

  const markMessageAsRead = async (msg: ContactMessage) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", msg.id);
    setContactMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
    if (selectedMessage?.id === msg.id) setSelectedMessage({ ...msg, is_read: true });
  };

  const deleteContactMessage = async (msg: ContactMessage) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", msg.id);
    if (error) {
      toast.error("فشل حذف الرسالة");
      return;
    }
    toast.success("تم حذف الرسالة");
    setContactMessages((prev) => prev.filter((m) => m.id !== msg.id));
    setDeleteMessageTarget(null);
    setSelectedMessage(null);
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    // Find the report to get reporter_id
    const report = reports.find((r) => r.id === reportId);

    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", reportId);

    if (error) {
      toast.error("فشل تحديث حالة البلاغ");
      return;
    }

    // Send notification to the reporter
    if (report) {
      const statusLabel = statusConfig[newStatus]?.label || newStatus;
      await supabase.from("notifications").insert({
        user_id: report.reporter_id,
        title: "تحديث حالة البلاغ",
        message: `تم تغيير حالة بلاغك على "${report.listing_title || "إعلان"}" إلى: ${statusLabel}`,
        type: "report_update",
        related_id: report.listing_id,
      });
    }

    toast.success("تم تحديث حالة البلاغ وإرسال إشعار للمستخدم");
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

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const bom = "\uFEFF";
    const csv = bom + [headers.join(","), ...rows.map(r => r.map(c => `"${(c || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`تم تصدير ${filename}`);
  };

  const exportReports = () => {
    downloadCSV(
      "reports.csv",
      ["الإعلان", "المُبلّغ", "السبب", "التفاصيل", "الحالة", "التاريخ"],
      reports.map(r => [
        r.listing_title || "",
        r.reporter_name || "",
        r.reason,
        r.details || "",
        statusConfig[r.status]?.label || r.status,
        formatDate(r.created_at),
      ])
    );
  };

  const exportListings = async () => {
    const { data } = await supabase.from("listings").select("title, category, city, area, price, status, views_count, created_at");
    if (!data || data.length === 0) { toast.error("لا توجد بيانات"); return; }
    downloadCSV(
      "listings.csv",
      ["العنوان", "التصنيف", "المدينة", "المنطقة", "السعر", "الحالة", "المشاهدات", "التاريخ"],
      data.map(l => [
        l.title,
        categoryLabels[l.category] || l.category,
        l.city,
        l.area || "",
        String(l.price),
        l.status || "",
        String(l.views_count || 0),
        formatDate(l.created_at),
      ])
    );
  };

  const exportUsers = async () => {
    const { data } = await supabase.from("profiles").select("full_name, city, created_at, user_id");
    if (!data || data.length === 0) { toast.error("لا توجد بيانات"); return; }
    
    // Fetch phone numbers securely via RPC for each user
    const enrichedData = await Promise.all(
      data.map(async (u) => {
        const { data: phone } = await supabase.rpc("get_user_phone", { _target_user_id: u.user_id });
        return { ...u, phone: phone || "" };
      })
    );
    
    downloadCSV(
      "users.csv",
      ["الاسم", "الهاتف", "المدينة", "تاريخ التسجيل"],
      enrichedData.map(u => [
        u.full_name || "",
        u.phone || "",
        u.city || "",
        formatDate(u.created_at),
      ])
    );
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">لوحة التحكم</h1>
              <p className="text-sm sm:text-base text-muted-foreground">إحصائيات عامة وإدارة البلاغات</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير CSV
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportReports}>
                <Flag className="h-4 w-4 ml-2" />
                تصدير البلاغات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportListings}>
                <FileText className="h-4 w-4 ml-2" />
                تصدير الإعلانات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportUsers}>
                <Users className="h-4 w-4 ml-2" />
                تصدير المستخدمين
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* General Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
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
                <p className="text-2xl font-bold text-foreground">{stats.views.toLocaleString("en-US")}</p>
                <p className="text-sm text-muted-foreground">مشاهدة إجمالية</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pushSubscribers}</p>
                <p className="text-sm text-muted-foreground">مشترك Push</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">توزيع الإعلانات حسب التصنيف</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.map(d => ({ ...d, name: categoryLabels[d.name] || d.name }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: number) => [`${value} إعلان`, "العدد"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">الإعلانات المضافة يومياً (آخر 30 يوم)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyListings}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(dailyListings.length / 6)} />
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
        </div>

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 mb-6">
          <div className="flex gap-2 w-max min-w-full sm:w-auto sm:flex-wrap">
            <Button
              variant={activeTab === "reports" ? "default" : "outline"}
              onClick={() => setActiveTab("reports")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Flag className="h-4 w-4" />
              البلاغات
            </Button>
            <Button
              variant={activeTab === "messages" ? "default" : "outline"}
              onClick={() => setActiveTab("messages")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Mail className="h-4 w-4" />
              رسائل التواصل
              {contactMessages.filter(m => !m.is_read).length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {contactMessages.filter(m => !m.is_read).length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "outline"}
              onClick={() => setActiveTab("settings")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Settings className="h-4 w-4" />
              إعدادات
            </Button>
            <Button
              variant={activeTab === "verification" ? "default" : "outline"}
              onClick={() => setActiveTab("verification")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <BadgeCheck className="h-4 w-4" />
              توثيق
            </Button>
            <Button
              variant={activeTab === "listings" ? "default" : "outline"}
              onClick={() => setActiveTab("listings")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <LayoutList className="h-4 w-4" />
              إدارة الإعلانات
            </Button>
            <Button
              variant={activeTab === "storage" ? "default" : "outline"}
              onClick={() => setActiveTab("storage")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <HardDrive className="h-4 w-4" />
              التخزين
            </Button>
            <Button
              variant={activeTab === "countries" ? "default" : "outline"}
              onClick={() => setActiveTab("countries")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Globe className="h-4 w-4" />
              الدول
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "outline"}
              onClick={() => setActiveTab("users")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Users className="h-4 w-4" />
              المستخدمون
            </Button>
            <Button
              variant={activeTab === "categories" ? "default" : "outline"}
              onClick={() => setActiveTab("categories")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Layers className="h-4 w-4" />
              التصنيفات
            </Button>
            <Button
              variant={activeTab === "upgrades" ? "default" : "outline"}
              onClick={() => setActiveTab("upgrades")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Star className="h-4 w-4" />
              طلبات الترقية
            </Button>
            <Button
              variant={activeTab === "subscriptions" ? "default" : "outline"}
              onClick={() => setActiveTab("subscriptions")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <CalendarClock className="h-4 w-4" />
              تقويم الباقات
            </Button>
            <Button
              variant={activeTab === "rewards" ? "default" : "outline"}
              onClick={() => setActiveTab("rewards")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Gift className="h-4 w-4" />
              المكافآت
            </Button>
            <Button
              variant={activeTab === "glow" ? "default" : "outline"}
              onClick={() => setActiveTab("glow")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <SparklesIcon className="h-4 w-4" />
              توهج الترقيات
            </Button>
            <Button
              variant={activeTab === "plans" ? "default" : "outline"}
              onClick={() => setActiveTab("plans")}
              className="gap-1.5 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <Gift className="h-4 w-4" />
              الباقات
            </Button>

          </div>
        </div>

        {activeTab === "reports" && (
          <>
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
          </>
        )}

        {activeTab === "messages" && (
          <>
            {messagesLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contactMessages.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground">لا توجد رسائل</p>
                  <p className="text-muted-foreground">لم يتم استلام أي رسائل تواصل بعد</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">البريد</TableHead>
                        <TableHead className="text-right">الموضوع</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactMessages.map((msg) => (
                        <TableRow key={msg.id} className={!msg.is_read ? "bg-primary/5" : ""}>
                          <TableCell className="font-medium">{msg.name}</TableCell>
                          <TableCell>{msg.email}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{msg.subject}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(msg.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant={msg.is_read ? "secondary" : "default"}>
                              {msg.is_read ? "مقروءة" : "جديدة"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => { setSelectedMessage(msg); if (!msg.is_read) markMessageAsRead(msg); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!msg.is_read && (
                                <Button size="sm" variant="ghost" onClick={() => markMessageAsRead(msg)}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteMessageTarget(msg)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === "settings" && <AdminSettingsTab />}
        
        {activeTab === "verification" && <AdminVerificationTab />}
        {activeTab === "listings" && <AdminListingsTab />}
        {activeTab === "storage" && <AdminStorageStats />}
        {activeTab === "countries" && <AdminCountriesTab />}
        {activeTab === "users" && <AdminUsersTab />}
        {activeTab === "categories" && <AdminCategoriesTab />}
        {activeTab === "upgrades" && <AdminUpgradeRequestsTab />}
        {activeTab === "subscriptions" && <AdminSubscriptionsTab />}
        {activeTab === "rewards" && <AdminRewardsTab />}
        {activeTab === "plans" && <AdminPlansTab />}

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

      {/* Contact Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">الاسم</p>
                <p className="font-medium">{selectedMessage.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium">{selectedMessage.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الموضوع</p>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرسالة</p>
                <p className="text-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{selectedMessage.message}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">التاريخ</p>
                <p className="font-medium">{formatDate(selectedMessage.created_at)}</p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`, "_blank")}
              >
                <Mail className="h-4 w-4 ml-2" />
                الرد عبر البريد
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => { setDeleteMessageTarget(selectedMessage); setSelectedMessage(null); }}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف الرسالة
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Contact Message Confirmation */}
      <AlertDialog open={!!deleteMessageTarget} onOpenChange={(open) => !open && setDeleteMessageTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الرسالة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف رسالة "{deleteMessageTarget?.subject}" من {deleteMessageTarget?.name}؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMessageTarget && deleteContactMessage(deleteMessageTarget)}
            >
              حذف الرسالة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReports;
