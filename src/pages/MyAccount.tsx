import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Edit2, Trash2, MapPin, Eye, ArrowRight, ArrowLeft, Plus, Settings, CheckCircle, RotateCcw, RefreshCw, CalendarClock, User, Mail, Phone, MapPinIcon, Crown, Star, CalendarDays, Clock } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditListingModal from "@/components/EditListingModal";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { formatPrice, formatDate, categoryLabels, statusLabels } from "@/lib/constants";
import { useListingSettings } from "@/hooks/useListingSettings";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  city: string;
  area: string | null;
  phone: string | null;
  images: string[] | null;
  status: string | null;
  is_featured: boolean | null;
  views_count: number | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

const planLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  professional: { label: "باقة احترافية", icon: <Crown className="h-5 w-5" />, color: "from-purple-600 to-indigo-600" },
  featured: { label: "باقة مميزة", icon: <Star className="h-5 w-5" />, color: "from-amber-500 to-orange-500" },
};

const MyAccount = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { settings } = useListingSettings();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const fetchListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(t.myAccount.loadError);
        console.error(error);
      } else {
        setListings(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchListings();

      // Fetch profile
      supabase
        .from("profiles")
        .select("full_name, phone, city, avatar_url, is_verified, created_at")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      // Fetch subscriptions
      supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setSubscriptions(data);
        });
    }
  }, [user]);

  // ... keep existing code (handleDelete, handleToggleSold, handleRenewListing, loading/auth checks)

  const handleDelete = async () => {
    if (!deletingListing) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", deletingListing.id);

      if (error) {
        toast.error(t.myAccount.deleteError + ": " + error.message);
      } else {
        toast.success(t.myAccount.deleteSuccess);
        setListings((prev) => prev.filter((l) => l.id !== deletingListing.id));
      }
    } finally {
      setDeleteLoading(false);
      setDeletingListing(null);
    }
  };

  const handleToggleSold = async (listing: Listing) => {
    const newStatus = listing.status === "sold" ? "active" : "sold";
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status: newStatus })
        .eq("id", listing.id);

      if (error) throw error;

      toast.success(newStatus === "sold" ? t.myAccount.soldSuccess : t.myAccount.reactivateSuccess);
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l))
      );
    } catch (error) {
      console.error("Error toggling sold status:", error);
      toast.error(t.myAccount.deleteError);
    }
  };

  const handleRenewListing = async (listing: Listing) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status: "active", created_at: new Date().toISOString() })
        .eq("id", listing.id);

      if (error) throw error;

      toast.success("تم تجديد الإعلان بنجاح");
      fetchListings();
    } catch (error) {
      console.error("Error renewing listing:", error);
      toast.error("فشل تجديد الإعلان");
    }
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const exp = new Date(expiresAt);
    const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active" && new Date(s.expires_at) > new Date()
  );
  const expiredSubscriptions = subscriptions.filter(
    (s) => s.status !== "active" || new Date(s.expires_at) <= new Date()
  );

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header onListingAdded={fetchListings} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.myAccount.title}</h1>
            <p className="text-muted-foreground mt-1">
              {t.myAccount.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/settings")} variant="outline">
              <Settings className="h-4 w-4" />
              {t.myAccount.settingsBtn}
            </Button>
            <Button onClick={() => navigate("/")} variant="outline">
              <BackArrow className="h-4 w-4" />
              {t.myAccount.backToHome}
            </Button>
          </div>
        </div>

        {/* Personal Info Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              المعلومات الشخصية
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
              </div>
              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">الاسم:</span>
                  <span className="font-medium text-foreground">{profile?.full_name || "غير محدد"}</span>
                  {profile?.is_verified && (
                    <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20">موثّق ✓</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">البريد:</span>
                  <span className="font-medium text-foreground" dir="ltr">{user.email || "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">الهاتف:</span>
                  <span className="font-medium text-foreground" dir="ltr">{profile?.phone || "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">المدينة:</span>
                  <span className="font-medium text-foreground">{profile?.city || "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">تاريخ التسجيل:</span>
                  <span className="font-medium text-foreground">{profile ? formatFullDate(profile.created_at) : "—"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Section */}
        {subscriptions.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                الاشتراكات
              </h2>

              {/* Active Subscriptions */}
              {activeSubscriptions.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">الاشتراكات النشطة</h3>
                  {activeSubscriptions.map((sub) => {
                    const plan = planLabels[sub.plan_type] || { label: sub.plan_type, icon: <Star className="h-5 w-5" />, color: "from-muted to-muted" };
                    const daysLeft = getDaysRemaining(sub.expires_at);
                    return (
                      <div key={sub.id} className="border border-border rounded-xl p-4 bg-card">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${plan.color} text-white flex items-center justify-center`}>
                              {plan.icon}
                            </div>
                            <div>
                              <span className="font-bold text-foreground">{plan.label}</span>
                              <Badge className="mr-2 bg-green-500/10 text-green-600 border-green-500/20 text-xs">نشط</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            متبقي <span className={`font-bold ${daysLeft <= 3 ? "text-destructive" : "text-primary"}`}>{daysLeft}</span> يوم
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground block text-xs">تاريخ الاشتراك</span>
                            <span className="font-medium text-foreground">{formatFullDate(sub.starts_at)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">تاريخ الانتهاء</span>
                            <span className="font-medium text-foreground">{formatFullDate(sub.expires_at)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">نوع الباقة</span>
                            <span className="font-medium text-foreground">{plan.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expired Subscriptions */}
              {expiredSubscriptions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">الاشتراكات المنتهية</h3>
                  {expiredSubscriptions.map((sub) => {
                    const plan = planLabels[sub.plan_type] || { label: sub.plan_type, icon: <Star className="h-5 w-5" />, color: "from-muted to-muted" };
                    return (
                      <div key={sub.id} className="border border-border rounded-xl p-4 bg-muted/30 opacity-70">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                            {plan.icon}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{plan.label}</span>
                            <Badge variant="outline" className="mr-2 text-xs">منتهي</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                          <div>
                            <span className="text-muted-foreground block text-xs">تاريخ الاشتراك</span>
                            <span className="text-foreground">{formatFullDate(sub.starts_at)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">تاريخ الانتهاء</span>
                            <span className="text-foreground">{formatFullDate(sub.expires_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Listings */}
        <h2 className="text-xl font-bold text-foreground mb-4">إعلاناتي</h2>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t.myAccount.noListings}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t.myAccount.noListingsDesc}
              </p>
              <Button onClick={() => navigate("/")}>
                {t.myAccount.addNewListing}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={listing.images?.[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                            {listing.title}
                          </h3>
                          <Badge variant={statusLabels[listing.status || "active"]?.variant || "default"}>
                            {statusLabels[listing.status || "active"]?.label || listing.status}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {listing.description || t.myAccount.noDescription}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {listing.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.views_count || 0} {t.myAccount.views}
                          </span>
                          <Badge variant="outline">
                            {categoryLabels[listing.category] || listing.category}
                          </Badge>
                          {listing.status === "active" && (() => {
                            const durationDays = listing.is_featured
                              ? settings.featured_listing.duration_days
                              : settings.free_listing.duration_days;
                            const createdAt = new Date(listing.created_at);
                            const expiryDate = new Date(createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
                            const now = new Date();
                            const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            const isExpiringSoon = daysLeft <= 3;
                            return (
                              <span className={`flex items-center gap-1 ${isExpiringSoon ? "text-destructive font-medium" : ""}`}>
                                <CalendarClock className="h-4 w-4" />
                                {daysLeft > 0
                                  ? `ينتهي خلال ${daysLeft} يوم`
                                  : "منتهي الصلاحية"}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div>
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(listing.price)}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {formatDate(listing.created_at)}
                          </span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {listing.status === "expired" ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleRenewListing(listing)}
                            >
                              <RefreshCw className="h-4 w-4" />
                              تجديد الإعلان
                            </Button>
                          ) : (
                            <Button
                              variant={listing.status === "sold" ? "outline" : "secondary"}
                              size="sm"
                              onClick={() => handleToggleSold(listing)}
                            >
                              {listing.status === "sold" ? (
                                <>
                                  <RotateCcw className="h-4 w-4" />
                                  {t.myAccount.markAsActive}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  {listing.category === "تعارف" ? "تم الزواج / الخطوبة" : t.myAccount.markAsSold}
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingListing(listing)}
                          >
                            <Edit2 className="h-4 w-4" />
                            {t.myAccount.editBtn}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingListing(listing)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t.myAccount.deleteBtn}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Edit Modal */}
      {editingListing && (
        <EditListingModal
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          listing={editingListing}
          onSuccess={() => {
            setEditingListing(null);
            fetchListings();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingListing} onOpenChange={() => setDeletingListing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.myAccount.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.myAccount.deleteConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t.myAccount.cancelBtn}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.myAccount.deleting}
                </>
              ) : (
                t.myAccount.deleteListingBtn
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyAccount;
