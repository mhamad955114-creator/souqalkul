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
import { Loader2, Search, Star, Crown, Gem, CheckCircle, XCircle, Clock, Eye, ChevronLeft, ChevronRight, Trash2, ImageOff, Pencil, MessageSquare } from "lucide-react";
import ListingAdminChat from "./ListingAdminChat";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { formatDate } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { useListingSettings } from "@/hooks/useListingSettings";

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
  description?: string | null;
  images?: string[] | null;
  city?: string;
  area?: string | null;
  phone?: string | null;
  metadata?: any;
}

const badgeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  featured: { label: "مميز ⭐", icon: <Star className="h-3.5 w-3.5" />, color: "bg-amber-500/10 text-amber-600" },
  professional: { label: "احترافي 👑", icon: <Crown className="h-3.5 w-3.5" />, color: "bg-purple-500/10 text-purple-600" },
  business: { label: "رجال أعمال 💎", icon: <Gem className="h-3.5 w-3.5" />, color: "bg-blue-500/10 text-blue-600" },
};

const AdminListingsTab = () => {
  const { settings } = useListingSettings();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [pendingListings, setPendingListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchById, setSearchById] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingListing, setRejectingListing] = useState<ListingRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewListing, setPreviewListing] = useState<ListingRow | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [deleteImagesListing, setDeleteImagesListing] = useState<ListingRow | null>(null);
  const [editListing, setEditListing] = useState<ListingRow | null>(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", description: "", status: "active" });
  const [deleteListing, setDeleteListing] = useState<ListingRow | null>(null);

  const openEditDialog = (listing: ListingRow) => {
    setEditListing(listing);
    setEditForm({
      title: listing.title || "",
      price: listing.price != null ? String(listing.price) : "",
      description: listing.description || "",
      status: listing.status || "active",
    });
  };

  const handleSaveEdit = async () => {
    if (!editListing) return;
    const priceNum = Number(editForm.price);
    if (!editForm.title.trim()) {
      toast.error("العنوان مطلوب");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error("السعر غير صالح");
      return;
    }
    setUpdating(editListing.id);
    const patch = {
      title: editForm.title.trim(),
      price: priceNum,
      description: editForm.description.trim() || null,
      status: editForm.status,
    };
    const { error } = await supabase.from("listings").update(patch as any).eq("id", editListing.id);
    if (error) {
      console.error(error);
      toast.error("فشل حفظ التعديلات");
    } else {
      toast.success("تم حفظ التعديلات");
      const apply = (l: ListingRow) => (l.id === editListing.id ? { ...l, ...patch } : l);
      setListings((prev) => prev.map(apply));
      setPendingListings((prev) => prev.map(apply));
      setEditListing(null);
    }
    setUpdating(null);
  };

  const handleDeleteListing = async (listing: ListingRow) => {
    setUpdating(listing.id);
    try {
      const urls = (listing.images || []).filter((u) => !!u);
      if (urls.length > 0) {
        try {
          const { deleteFromB2 } = await import("@/lib/b2Delete");
          await deleteFromB2({ urls });
        } catch (e) {
          console.error("B2 delete failed", e);
        }
      }
      const { error } = await supabase.from("listings").delete().eq("id", listing.id);
      if (error) throw error;
      toast.success(`تم حذف الإعلان "${listing.title}"`);
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
      setPendingListings((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف الإعلان");
    }
    setUpdating(null);
    setDeleteListing(null);
  };


  const fetchListings = async () => {
    setLoading(true);

    // Fetch active/sold listings
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, user_id, status, badge_type, created_at, category, price, description, images, city, area, phone, metadata")
      .in("status", ["active", "sold"])
      .order("created_at", { ascending: false })
      .limit(200);

    // Fetch pending listings
    const { data: pending, error: pendingError } = await supabase
      .from("listings")
      .select("id, title, user_id, status, badge_type, created_at, category, price, description, images, city, area, phone, metadata")
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

  const handleSetBadge = async (listing: ListingRow, badgeType: string | null) => {
    setUpdating(listing.id);
    try {
      const { error } = await supabase
        .from("listings")
        .update({ badge_type: badgeType, is_featured: badgeType === "featured" } as any)
        .eq("id", listing.id);

      if (error) throw error;

      if (badgeType && ["featured", "professional", "business"].includes(badgeType)) {
        const nowIso = new Date().toISOString();
        const { data: activeSubscriptions, error: subscriptionsError } = await supabase
          .from("user_subscriptions")
          .select("id, expires_at")
          .eq("user_id", listing.user_id)
          .eq("status", "active")
          .gte("expires_at", nowIso)
          .order("expires_at", { ascending: false });

        if (subscriptionsError) throw subscriptionsError;

        const fallbackDays = badgeType === "business"
          ? settings.business_listing.duration_days
          : badgeType === "professional"
            ? settings.professional_listing.duration_days
            : settings.featured_listing.duration_days;

        const expiresAt = new Date(Date.now() + fallbackDays * 24 * 60 * 60 * 1000).toISOString();

        if (activeSubscriptions && activeSubscriptions.length > 0) {
          const { error: deactivateError } = await supabase
            .from("user_subscriptions")
            .update({ status: "inactive" } as any)
            .eq("user_id", listing.user_id)
            .eq("status", "active")
            .gte("expires_at", nowIso);

          if (deactivateError) throw deactivateError;
        }

        const { error: insertError } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: listing.user_id,
            plan_type: badgeType,
            starts_at: nowIso,
            expires_at: expiresAt,
            status: "active",
          } as any);

        if (insertError) throw insertError;

        await supabase.from("notifications").insert({
          user_id: listing.user_id,
          title: "تم تحديث باقتك",
          message: `تم تغيير باقتك إلى ${badgeConfig[badgeType]?.label || badgeType}`,
          type: "subscription",
        } as any);
      }

      toast.success(badgeType ? `تم تعيين الإعلان كـ ${badgeConfig[badgeType]?.label}` : "تم إزالة التصنيف");
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, badge_type: badgeType } : l
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("فشل تحديث نوع الإعلان");
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

  const handleDeleteImages = async (listing: ListingRow) => {
    if (!listing.images || listing.images.length === 0) {
      toast.info("لا توجد صور لحذفها");
      return;
    }
    setUpdating(listing.id);
    try {
      // Delete from B2
      const urls = listing.images.filter((u) => !!u);
      if (urls.length > 0) {
        const { deleteFromB2 } = await import("@/lib/b2Delete");
        await deleteFromB2({ urls });
      }

      await supabase.from("listings").update({ images: [] } as any).eq("id", listing.id);

      toast.success(`تم حذف ${urls.length} صورة من "${listing.title}"`);
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, images: [] } : l))
      );
      setPendingListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, images: [] } : l))
      );
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف الصور");
    }
    setUpdating(null);
    setDeleteImagesListing(null);
  };

  const searchLower = search.toLowerCase().trim();
  const filterFn = (l: ListingRow) => {
    if (!searchLower) return true;
    if (searchById) {
      return l.id.toLowerCase() === searchLower;
    }
    return (
      l.title.toLowerCase().includes(searchLower) ||
      l.user_email?.toLowerCase().includes(searchLower) ||
      l.id.toLowerCase().includes(searchLower)
    );
  };
  const filtered = listings.filter(filterFn);
  const filteredPending = pendingListings.filter(filterFn);

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
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <Button
            variant={searchById ? "default" : "outline"}
            size="sm"
            onClick={() => { setSearchById(!searchById); setSearch(""); }}
            className="whitespace-nowrap text-xs"
          >
            🔢 بحث برقم الإعلان
          </Button>
          {searchById && (
            <span className="text-xs text-muted-foreground">
              الصق رقم الإعلان (UUID) مثل: <code className="bg-muted px-1 rounded text-[10px]">a1b2c3d4-e5f6-...</code>
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchById ? "الصق رقم الإعلان (UUID) هنا..." : "البحث بعنوان الإعلان أو رقم الإعلان أو اسم المستخدم..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            dir="ltr"
          />
        </div>
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
                              variant="outline"
                              className="gap-1 text-xs"
                              onClick={() => { setPreviewListing(listing); setPreviewImageIndex(0); }}
                            >
                              <Eye className="h-3 w-3" />
                              معاينة
                            </Button>
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
                    <TableHead className="text-right">الصورة</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">التصنيف الحالي</TableHead>
                    <TableHead className="text-right">تعيين التصنيف</TableHead>
                    <TableHead className="text-right">الصور</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        لا توجد إعلانات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((listing) => {
                      const cover = (listing.images || []).find((u) => u && !u.match(/\.(mp4|webm|mov)$/i));
                      return (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => { setPreviewListing(listing); setPreviewImageIndex(0); }}
                            className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center"
                          >
                            {cover ? (
                              <img src={cover} alt={listing.title} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <ImageOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {listing.title}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-bold text-primary text-sm">
                          {listing.price?.toLocaleString("en-US")}
                        </TableCell>
                        <TableCell>{listing.user_email}</TableCell>
                        <TableCell>
                          <Badge variant={listing.status === "sold" ? "secondary" : "outline"} className="text-xs">
                            {listing.status === "sold" ? "مباع" : "نشط"}
                          </Badge>
                        </TableCell>
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
                                  handleSetBadge(listing, val === "none" ? null : val)
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
                        <TableCell>
                          {listing.images && listing.images.length > 0 ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-xs text-destructive hover:text-destructive"
                              onClick={() => setDeleteImagesListing(listing)}
                              disabled={updating === listing.id}
                            >
                              <Trash2 className="h-3 w-3" />
                              {listing.images.length} صور
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                              <ImageOff className="h-3 w-3" /> لا صور
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-xs"
                              onClick={() => { setPreviewListing(listing); setPreviewImageIndex(0); }}
                            >
                              <Eye className="h-3 w-3" />
                              عرض
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-xs"
                              onClick={() => openEditDialog(listing)}
                              disabled={updating === listing.id}
                            >
                              <Pencil className="h-3 w-3" />
                              تعديل
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-xs"
                              onClick={() => setMessageListing(listing)}
                            >
                              <MessageSquare className="h-3 w-3" />
                              مراسلة
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1 text-xs"
                              onClick={() => setDeleteListing(listing)}
                              disabled={updating === listing.id}
                            >
                              <Trash2 className="h-3 w-3" />
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })

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

      {/* Listing Preview Dialog */}
      <Dialog open={!!previewListing} onOpenChange={(open) => !open && setPreviewListing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-right">معاينة الإعلان</DialogTitle>
          </DialogHeader>
          {previewListing && (
            <ScrollArea className="max-h-[65vh]">
              <div className="space-y-4 p-1">
                {/* Images */}
                {previewListing.images && previewListing.images.length > 0 && (
                  <div className="relative">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      {previewListing.images[previewImageIndex]?.match(/\.(mp4|webm|mov)$/i) ? (
                        <video
                          src={previewListing.images[previewImageIndex]}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={previewListing.images[previewImageIndex]}
                          alt={previewListing.title}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    {previewListing.images.length > 1 && (
                      <>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80"
                          onClick={() => setPreviewImageIndex((i) => (i + 1) % previewListing.images!.length)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-1/2 left-2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80"
                          onClick={() => setPreviewImageIndex((i) => (i - 1 + previewListing.images!.length) % previewListing.images!.length)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-foreground">
                          {previewImageIndex + 1} / {previewListing.images.length}
                        </div>
                      </>
                    )}
                    {/* Thumbnails */}
                    {previewListing.images.length > 1 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        {previewListing.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPreviewImageIndex(idx)}
                            className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                              idx === previewImageIndex ? "border-primary" : "border-transparent"
                            }`}
                          >
                            {img.match(/\.(mp4|webm|mov)$/i) ? (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">🎬</div>
                            ) : (
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Info Table */}
                <div className="border rounded-lg divide-y">
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground text-sm">العنوان</span>
                    <span className="font-medium text-sm">{previewListing.title}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground text-sm">السعر</span>
                    <span className="font-bold text-primary text-sm">{previewListing.price?.toLocaleString()} ل.س</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground text-sm">التصنيف</span>
                    <span className="text-sm">{previewListing.category}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground text-sm">المدينة</span>
                    <span className="text-sm">{previewListing.city}{previewListing.area ? ` - ${previewListing.area}` : ""}</span>
                  </div>
                  {previewListing.phone && (
                    <div className="flex justify-between p-3">
                      <span className="text-muted-foreground text-sm">رقم الهاتف</span>
                      <span className="text-sm" dir="ltr">{previewListing.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground text-sm">المستخدم</span>
                    <span className="text-sm">{previewListing.user_email}</span>
                  </div>
                  {previewListing.badge_type && badgeConfig[previewListing.badge_type] && (
                    <div className="flex justify-between p-3 items-center">
                      <span className="text-muted-foreground text-sm">الباقة</span>
                      <Badge variant="secondary" className={badgeConfig[previewListing.badge_type].color}>
                        {badgeConfig[previewListing.badge_type].label}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between p-3">
                    <span className="text-muted-foreground text-sm">تاريخ النشر</span>
                    <span className="text-sm">{formatDate(previewListing.created_at)}</span>
                  </div>
                </div>

                {/* Metadata */}
                {previewListing.metadata && typeof previewListing.metadata === "object" && Object.keys(previewListing.metadata).length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {Object.entries(previewListing.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-3">
                        <span className="text-muted-foreground text-sm">{key}</span>
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                {previewListing.description && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">الوصف</p>
                    <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{previewListing.description}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPreviewListing(null)}>
              إغلاق
            </Button>
            {previewListing?.status === "pending" && (
              <>
                <Button
                  variant="default"
                  className="gap-1"
                  onClick={() => { handleApproveListing(previewListing); setPreviewListing(null); }}
                  disabled={updating === previewListing?.id}
                >
                  <CheckCircle className="h-4 w-4" />
                  قبول
                </Button>
                <Button
                  variant="destructive"
                  className="gap-1"
                  onClick={() => { setPreviewListing(null); openRejectDialog(previewListing); }}
                >
                  <XCircle className="h-4 w-4" />
                  رفض
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Images Confirmation */}
      <AlertDialog open={!!deleteImagesListing} onOpenChange={(open) => !open && setDeleteImagesListing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف صور الإعلان نهائياً</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف جميع صور الإعلان "{deleteImagesListing?.title}" نهائياً من التخزين؟ لا يمكن التراجع عن هذا الإجراء.
              <br />
              <span className="font-medium">عدد الصور: {deleteImagesListing?.images?.length || 0}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteImagesListing && handleDeleteImages(deleteImagesListing)}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Listing Dialog */}
      <Dialog open={!!editListing} onOpenChange={(open) => !open && setEditListing(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل الإعلان</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-4 p-1">
              {editListing?.images && editListing.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {editListing.images.map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
                      {img.match(/\.(mp4|webm|mov)$/i) ? (
                        <div className="w-full h-full flex items-center justify-center text-xs">🎬</div>
                      ) : (
                        <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-title">العنوان</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">السعر</Label>
                <Input
                  id="edit-price"
                  type="number"
                  inputMode="numeric"
                  dir="ltr"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm((f) => ({ ...f, status: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="sold">مباع</SelectItem>
                    <SelectItem value="pending">بانتظار الموافقة</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  rows={5}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditListing(null)}>إلغاء</Button>
            <Button onClick={handleSaveEdit} disabled={updating === editListing?.id}>
              {updating === editListing?.id && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Listing Confirmation */}
      <AlertDialog open={!!deleteListing} onOpenChange={(open) => !open && setDeleteListing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإعلان نهائياً</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الإعلان "{deleteListing?.title}" وجميع صوره ({deleteListing?.images?.length || 0}) نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteListing && handleDeleteListing(deleteListing)}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
};

export default AdminListingsTab;
