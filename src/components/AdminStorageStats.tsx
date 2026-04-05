import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Loader2, HardDrive, Image, FileArchive, RefreshCw, Database, Trash2, AlertTriangle, Settings2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { toast } from "sonner";

interface StorageStats {
  listings_bucket: { total_size_mb: number; file_count: number };
  receipts_bucket: { total_size_mb: number; file_count: number };
  total: { total_size_mb: number; total_files: number };
  image_stats: { total_images: number; active_images: number; expired_images: number };
  by_badge: Record<string, { count: number; images: number }>;
}

const DEFAULT_STORAGE_LIMIT_MB = 1024;

const badgeLabels: Record<string, string> = {
  free: "مجاني",
  featured: "مميز",
  professional: "احترافي",
  business: "رجال أعمال",
};

const badgeColors: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  featured: "bg-amber-500/10 text-amber-600",
  professional: "bg-purple-500/10 text-purple-600",
  business: "bg-blue-500/10 text-blue-600",
};

function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/listings\/(.+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const AdminStorageStats = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [storageLimitMb, setStorageLimitMb] = useState(DEFAULT_STORAGE_LIMIT_MB);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [editingLimit, setEditingLimit] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [newLimit, setNewLimit] = useState("");
  const [newThreshold, setNewThreshold] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);
  const [savingThreshold, setSavingThreshold] = useState(false);

  const fetchStorageSettings = async () => {
    const { data } = await supabase
      .from("listing_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["storage_limit_mb", "storage_alert_threshold"]);
    if (data) {
      for (const row of data) {
        const val = typeof row.setting_value === "number" ? row.setting_value : Number(row.setting_value);
        if (isNaN(val) || val <= 0) continue;
        if (row.setting_key === "storage_limit_mb") setStorageLimitMb(val);
        if (row.setting_key === "storage_alert_threshold") setAlertThreshold(val);
      }
    }
  };

  const saveStorageLimit = async () => {
    const val = Number(newLimit);
    if (isNaN(val) || val <= 0) {
      toast.error("يرجى إدخال قيمة صحيحة");
      return;
    }
    setSavingLimit(true);
    try {
      const { data: existing } = await supabase
        .from("listing_settings")
        .select("id")
        .eq("setting_key", "storage_limit_mb")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("listing_settings")
          .update({ setting_value: val as unknown as import("@/integrations/supabase/types").Json })
          .eq("setting_key", "storage_limit_mb");
      } else {
        await supabase
          .from("listing_settings")
          .insert({ setting_key: "storage_limit_mb", setting_value: val as unknown as import("@/integrations/supabase/types").Json });
      }
      setStorageLimitMb(val);
      setEditingLimit(false);
      toast.success("تم تحديث الحد الأقصى للتخزين");
    } catch {
      toast.error("فشل في حفظ الإعداد");
    } finally {
      setSavingLimit(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/storage-stats`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch storage stats");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      toast.error("فشل في تحميل إحصائيات التخزين");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiredWithImages = async () => {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .in("status", ["expired", "rejected"])
      .not("images", "eq", "{}");
    setExpiredCount(count || 0);
  };

  useEffect(() => {
    fetchStorageLimit();
    fetchStats();
    fetchExpiredWithImages();
  }, []);

  const handleBulkDeleteExpiredImages = async () => {
    setBulkDeleting(true);
    setShowBulkDeleteConfirm(false);
    try {
      // Fetch expired listings that still have images
      const { data: expiredListings, error } = await supabase
        .from("listings")
        .select("id, images, user_id")
        .in("status", ["expired", "rejected"])
        .not("images", "eq", "{}");

      if (error) throw error;
      if (!expiredListings || expiredListings.length === 0) {
        toast.info("لا توجد صور منتهية لحذفها");
        setBulkDeleting(false);
        return;
      }

      let totalDeleted = 0;
      let totalFailed = 0;

      for (const listing of expiredListings) {
        const images = listing.images || [];
        if (images.length === 0) continue;

        const paths = images
          .map((url: string) => extractStoragePath(url))
          .filter(Boolean) as string[];

        if (paths.length > 0) {
          const { error: removeError } = await supabase.storage
            .from("listings")
            .remove(paths);

          if (removeError) {
            totalFailed += paths.length;
            console.error(`Failed to delete images for listing ${listing.id}:`, removeError);
          } else {
            totalDeleted += paths.length;
          }
        }

        // Clear images array in DB
        await supabase
          .from("listings")
          .update({ images: [] })
          .eq("id", listing.id);
      }

      if (totalDeleted > 0) {
        toast.success(`تم حذف ${totalDeleted} صورة من ${expiredListings.length} إعلان منتهي`);
      }
      if (totalFailed > 0) {
        toast.warning(`فشل حذف ${totalFailed} ملف`);
      }

      // Refresh stats
      await Promise.all([fetchStats(), fetchExpiredWithImages()]);
    } catch (err: any) {
      toast.error("فشل في حذف الصور: " + (err.message || "خطأ غير معروف"));
      console.error(err);
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <HardDrive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">لا تتوفر بيانات</p>
          <Button onClick={fetchStats} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 ml-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  const usagePercent = Math.min((stats.total.total_size_mb / storageLimitMb) * 100, 100);

  const formatSize = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(mb * 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          إحصائيات التخزين
        </h2>
        <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* Storage Alert Banner */}
      {usagePercent >= 80 && (
        <Card className={usagePercent >= 95 ? "border-destructive bg-destructive/5" : "border-amber-500 bg-amber-500/5"}>
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${usagePercent >= 95 ? "text-destructive" : "text-amber-500"}`} />
            <div>
              <p className={`font-semibold ${usagePercent >= 95 ? "text-destructive" : "text-amber-600"}`}>
                {usagePercent >= 95 ? "تحذير: التخزين شبه ممتلئ!" : "تنبيه: استخدام التخزين مرتفع"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                استخدام التخزين وصل إلى {usagePercent.toFixed(1)}%. يرجى حذف الصور المنتهية لتوفير المساحة.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Usage */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">الاستخدام الإجمالي</span>
            <div className="flex items-center gap-2">
              {editingLimit ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-24 h-7 text-xs"
                    placeholder="MB"
                    min={1}
                  />
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={saveStorageLimit} disabled={savingLimit}>
                    {savingLimit ? <Loader2 className="h-3 w-3 animate-spin" /> : "حفظ"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setEditingLimit(false)}>
                    إلغاء
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => { setNewLimit(String(storageLimitMb)); setEditingLimit(true); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {formatSize(stats.total.total_size_mb)} / {formatSize(storageLimitMb)}
                  <Settings2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <Progress value={usagePercent} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground text-left">{usagePercent.toFixed(1)}%</p>
        </CardContent>
      </Card>

      {/* Bucket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{formatSize(stats.listings_bucket.total_size_mb)}</p>
              <p className="text-sm text-muted-foreground">صور الإعلانات</p>
              <p className="text-xs text-muted-foreground">{stats.listings_bucket.file_count} ملف</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <FileArchive className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{formatSize(stats.receipts_bucket.total_size_mb)}</p>
              <p className="text-sm text-muted-foreground">الإيصالات</p>
              <p className="text-xs text-muted-foreground">{stats.receipts_bucket.file_count} ملف</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Database className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.total.total_files}</p>
              <p className="text-sm text-muted-foreground">إجمالي الملفات</p>
              <p className="text-xs text-muted-foreground">{formatSize(stats.total.total_size_mb)} إجمالي</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Distribution */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">توزيع الصور حسب الحالة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.image_stats.total_images}</p>
              <p className="text-sm text-muted-foreground">إجمالي الصور</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/5">
              <p className="text-2xl font-bold text-green-600">{stats.image_stats.active_images}</p>
              <p className="text-sm text-muted-foreground">صور نشطة</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/5">
              <p className="text-2xl font-bold text-destructive">{stats.image_stats.expired_images}</p>
              <p className="text-sm text-muted-foreground">صور منتهية</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Delete Expired Images */}
      <Card className={expiredCount > 0 ? "border-destructive/30" : ""}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                حذف صور الإعلانات المنتهية
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {expiredCount > 0
                  ? `يوجد ${expiredCount} إعلان منتهي/مرفوض يحتوي على صور يمكن حذفها لتوفير المساحة`
                  : "لا توجد إعلانات منتهية تحتوي على صور"}
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowBulkDeleteConfirm(true)}
              disabled={bulkDeleting || expiredCount === 0}
              className="shrink-0"
            >
              {bulkDeleting ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 ml-2" />
              )}
              {bulkDeleting ? "جاري الحذف..." : "حذف جماعي"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* By Badge Type */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">توزيع حسب نوع الباقة</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(stats.by_badge).map(([badge, data]) => (
              <div
                key={badge}
                className={`p-4 rounded-lg text-center ${badgeColors[badge] || "bg-muted"}`}
              >
                <p className="text-sm font-medium mb-1">{badgeLabels[badge] || badge}</p>
                <p className="text-xl font-bold">{data.count}</p>
                <p className="text-xs opacity-75">{data.images} صورة</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف الجماعي</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف جميع صور {expiredCount} إعلان منتهي/مرفوض نهائياً من التخزين.
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBulkDeleteExpiredImages}
            >
              حذف الكل نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminStorageStats;
