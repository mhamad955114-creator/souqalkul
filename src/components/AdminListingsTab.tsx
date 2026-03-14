import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Loader2, Search, Star, Crown, Gem, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ListingRow {
  id: string;
  title: string;
  user_id: string;
  status: string | null;
  badge_type: string | null;
  created_at: string;
  user_email?: string;
  category?: string;
  price?: number;
}

const badgeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  featured: { label: "مميز ⭐", icon: <Star className="h-3.5 w-3.5" />, color: "bg-amber-500/10 text-amber-600" },
  professional: { label: "احترافي 👑", icon: <Crown className="h-3.5 w-3.5" />, color: "bg-purple-500/10 text-purple-600" },
  business: { label: "رجال أعمال 💎", icon: <Gem className="h-3.5 w-3.5" />, color: "bg-blue-500/10 text-blue-600" },
};

const AdminListingsTab = () => {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [pendingListings, setPendingListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingListing, setRejectingListing] = useState<ListingRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchListings = async () => {
    setLoading(true);

    // Fetch active/sold listings
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, user_id, status, badge_type, created_at, category, price")
      .in("status", ["active", "sold"])
      .order("created_at", { ascending: false })
      .limit(200);

    // Fetch pending listings
    const { data: pending, error: pendingError } = await supabase
      .from("listings")
      .select("id, title, user_id, status, badge_type, created_at, category, price")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(200);

    const allData = [...(data || []), ...(pending || [])];
    const userIds = [...new Set(allData.map((l) => l.user_id))];

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

    if (!error && data) {
      setListings(
        data.map((l) => ({
          ...l,
          badge_type: (l as any).badge_type ?? null,
          user_email: profileMap.get(l.user_id) || "بدون اسم",
        }))
      );
    }

    if (!pendingError && pending) {
      setPendingListings(
        pending.map((l) => ({
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

  const handleApproveListing = async (listing: ListingRow) => {
    setUpdating(listing.id);
    const { error } = await supabase
      .from("listings")
      .update({ status: "active" } as any)
      .eq("id", listing.id);

    if (error) {
      toast.error("فشل قبول الإعلان");
    } else {
      toast.success(`تم قبول الإعلان "${listing.title}"`);
      // Notify the user
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        title: "تم قبول إعلانك ✅",
        message: `تم قبول إعلانك "${listing.title}" وهو الآن مرئي للجميع`,
        type: "listing_approved",
      } as any);
      setPendingListings((prev) => prev.filter((l) => l.id !== listing.id));
      setListings((prev) => [{ ...listing, status: "active" }, ...prev]);
    }
    setUpdating(null);
  };

  const openRejectDialog = (listing: ListingRow) => {
    setRejectingListing(listing);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectListing = async () => {
    if (!rejectingListing) return;
    const listing = rejectingListing;
    setUpdating(listing.id);
    const { error } = await supabase
      .from("listings")
      .update({ status: "rejected" } as any)
      .eq("id", listing.id);

    if (error) {
      toast.error("فشل رفض الإعلان");
    } else {
      toast.success(`تم رفض الإعلان "${listing.title}"`);
      const reasonText = rejectReason.trim()
        ? `\nسبب الرفض: ${rejectReason.trim()}`
        : ". يرجى التواصل مع الإدارة لمزيد من التفاصيل";
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        title: "تم رفض إعلانك ❌",
        message: `تم رفض إعلانك "${listing.title}"${reasonText}`,
        type: "listing_rejected",
      } as any);
      setPendingListings((prev) => prev.filter((l) => l.id !== listing.id));
    }
    setUpdating(null);
    setRejectDialogOpen(false);
    setRejectingListing(null);
    setRejectReason("");
  };

  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPending = pendingListings.filter(
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{listings.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
          </CardContent>
        </Card>
        <Card className={pendingListings.length > 0 ? "border-orange-500/50 bg-orange-500/5" : ""}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{pendingListings.length}</p>
            <p className="text-sm text-muted-foreground">بانتظار الموافقة</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1 gap-2">
            <Clock className="h-4 w-4" />
            بانتظار الموافقة
            {pendingListings.length > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {pendingListings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 gap-2">
            إدارة الإعلانات
          </TabsTrigger>
        </TabsList>

        {/* Pending Listings Tab */}
        <TabsContent value="pending">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الباقة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد إعلانات بانتظار الموافقة 🎉
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPending.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {listing.title}
                        </TableCell>
                        <TableCell>{listing.user_email}</TableCell>
                        <TableCell>
                          {listing.badge_type && badgeConfig[listing.badge_type] ? (
                            <Badge variant="secondary" className={badgeConfig[listing.badge_type].color}>
                              {badgeConfig[listing.badge_type].label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(listing.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-1 text-xs"
                              onClick={() => handleApproveListing(listing)}
                              disabled={updating === listing.id}
                            >
                              {updating === listing.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              قبول
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1 text-xs"
                              onClick={() => openRejectDialog(listing)}
                              disabled={updating === listing.id}
                            >
                              <XCircle className="h-3 w-3" />
                              رفض
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Active Listings Tab */}
        <TabsContent value="active">
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
        </TabsContent>
      </Tabs>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>رفض الإعلان</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              هل تريد رفض الإعلان: <strong>{rejectingListing?.title}</strong>؟
            </p>
            <div className="space-y-2">
              <Label htmlFor="reject-reason">سبب الرفض (اختياري)</Label>
              <Textarea
                id="reject-reason"
                placeholder="اكتب سبب الرفض ليتم إرساله للمستخدم..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectListing}
              disabled={updating === rejectingListing?.id}
            >
              {updating === rejectingListing?.id ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <XCircle className="h-4 w-4 ml-2" />
              )}
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminListingsTab;
