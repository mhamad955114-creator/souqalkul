import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner";
import { Loader2, Search, Star, Crown, Gem, X } from "lucide-react";
import { formatDate } from "@/lib/constants";

interface ListingRow {
  id: string;
  title: string;
  user_id: string;
  status: string | null;
  badge_type: string | null;
  created_at: string;
  user_email?: string;
}

const badgeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  featured: { label: "مميز ⭐", icon: <Star className="h-3.5 w-3.5" />, color: "bg-amber-500/10 text-amber-600" },
  professional: { label: "احترافي 👑", icon: <Crown className="h-3.5 w-3.5" />, color: "bg-purple-500/10 text-purple-600" },
  business: { label: "رجال أعمال 💎", icon: <Gem className="h-3.5 w-3.5" />, color: "bg-blue-500/10 text-blue-600" },
};

const AdminListingsTab = () => {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, user_id, status, badge_type, created_at")
      .in("status", ["active", "sold"])
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      const userIds = [...new Set(data.map((l) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.full_name || "بدون اسم"])
      );

      setListings(
        data.map((l) => ({
          ...l,
          badge_type: (l as any).badge_type ?? null,
          user_email: profileMap.get(l.user_id) || "بدون اسم",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSetBadge = async (listingId: string, badgeType: string | null) => {
    setUpdating(listingId);
    const { error } = await supabase
      .from("listings")
      .update({ badge_type: badgeType, is_featured: badgeType === "featured" } as any)
      .eq("id", listingId);

    if (error) {
      toast.error("فشل تحديث نوع الإعلان");
    } else {
      toast.success(badgeType ? `تم تعيين الإعلان كـ ${badgeConfig[badgeType]?.label}` : "تم إزالة التصنيف");
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, badge_type: badgeType } : l
        )
      );
    }
    setUpdating(null);
  };

  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{listings.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
          </CardContent>
        </Card>
        {Object.entries(badgeConfig).map(([key, config]) => (
          <Card key={key}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {listings.filter((l) => l.badge_type === key).length}
              </p>
              <p className="text-sm text-muted-foreground">{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث بعنوان الإعلان أو اسم المستخدم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">التصنيف الحالي</TableHead>
                <TableHead className="text-right">تعيين التصنيف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا توجد إعلانات
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {listing.title}
                    </TableCell>
                    <TableCell>{listing.user_email}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(listing.created_at)}</TableCell>
                    <TableCell>
                      {listing.badge_type && badgeConfig[listing.badge_type] ? (
                        <Badge variant="secondary" className={badgeConfig[listing.badge_type].color}>
                          {badgeConfig[listing.badge_type].label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">عادي</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={listing.badge_type || "none"}
                          onValueChange={(val) =>
                            handleSetBadge(listing.id, val === "none" ? null : val)
                          }
                          disabled={updating === listing.id}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">عادي</SelectItem>
                            <SelectItem value="featured">⭐ مميز</SelectItem>
                            <SelectItem value="professional">👑 احترافي</SelectItem>
                            <SelectItem value="business">💎 رجال أعمال</SelectItem>
                          </SelectContent>
                        </Select>
                        {updating === listing.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminListingsTab;
