import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Loader2, HardDrive, Image, FileArchive, RefreshCw, Database } from "lucide-react";
import { toast } from "sonner";

interface StorageStats {
  listings_bucket: { total_size_mb: number; file_count: number };
  receipts_bucket: { total_size_mb: number; file_count: number };
  total: { total_size_mb: number; total_files: number };
  image_stats: { total_images: number; active_images: number; expired_images: number };
  by_badge: Record<string, { count: number; images: number }>;
}

const STORAGE_LIMIT_MB = 1024; // 1 GB default

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

const AdminStorageStats = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchStats();
  }, []);

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

  const usagePercent = Math.min((stats.total.total_size_mb / STORAGE_LIMIT_MB) * 100, 100);

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

      {/* Overall Usage */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">الاستخدام الإجمالي</span>
            <span className="text-sm text-muted-foreground">
              {formatSize(stats.total.total_size_mb)} / {formatSize(STORAGE_LIMIT_MB)}
            </span>
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
    </div>
  );
};

export default AdminStorageStats;
