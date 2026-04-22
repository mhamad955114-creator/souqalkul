import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uploadToB2 } from "@/lib/b2Upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Edit2, Trash2, MapPin, Eye, ArrowRight, ArrowLeft, Plus, Settings, CheckCircle, RotateCcw, RefreshCw, CalendarClock, User, Mail, Phone, MapPinIcon, Crown, Star, CalendarDays, Clock, Save, X, Camera, Lock, AlertTriangle, Briefcase, BarChart3, TrendingUp, Heart, Pin, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditListingModal from "@/components/EditListingModal";
import AddListingModal from "@/components/AddListingModal";
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
import { formatPrice, formatDate, categoryLabels, statusLabels, getCountryByName } from "@/lib/constants";
import { useListingSettings } from "@/hooks/useListingSettings";
import { getEffectiveActiveSubscription, getHigherPriorityPlan, getHighestActiveListingPlan, getSubscriptionPriority, isSubscriptionActive, sortSubscriptionsByPriority } from "@/lib/subscriptions";

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
  country?: string | null;
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
  business: { label: "باقة رجال الأعمال", icon: <Briefcase className="h-5 w-5" />, color: "from-blue-600 to-cyan-600" },
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
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [listingTab, setListingTab] = useState("all");
  const [listingSearch, setListingSearch] = useState("");
  const [addListingModalOpen, setAddListingModalOpen] = useState(false);
  const [businessStats, setBusinessStats] = useState<{
    totalViews: number;
    totalFavorites: number;
    totalListings: number;
    activeListings: number;
    soldListings: number;
    avgViewsPerListing: number;
    topListings: { id: string; title: string; views: number }[];
  } | null>(null);
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  // Filtered listings based on tab and search
  const filteredListings = useMemo(() => {
    let filtered = listings;
    // Tab filter
    if (listingTab === "active") filtered = filtered.filter((l) => l.status === "active");
    else if (listingTab === "sold") filtered = filtered.filter((l) => l.status === "sold");
    else if (listingTab === "expired") filtered = filtered.filter((l) => l.status === "expired");
    // Search filter
    if (listingSearch.trim()) {
      const q = listingSearch.trim().toLowerCase();
      filtered = filtered.filter((l) => l.title.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || (l.description || "").toLowerCase().includes(q));
    }
    return filtered;
  }, [listings, listingTab, listingSearch]);

  const listingStats = useMemo(() => ({
    total: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    sold: listings.filter((l) => l.status === "sold").length,
    expired: listings.filter((l) => l.status === "expired").length,
    totalViews: listings.reduce((sum, l) => sum + (l.views_count || 0), 0),
  }), [listings]);

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

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!data) return;

    const orderedSubscriptions = sortSubscriptionsByPriority(data);
    setSubscriptions(orderedSubscriptions);

    const listingsRes = await supabase
      .from("listings")
      .select("id, title, views_count, status, badge_type, created_at")
      .eq("user_id", user.id);

    const userListings = listingsRes.data || [];
    const currentSubscription = getEffectiveActiveSubscription(orderedSubscriptions);
    const highestListingPlan = getHighestActiveListingPlan(userListings);
    const effectivePlan = getHigherPriorityPlan(currentSubscription?.plan_type, highestListingPlan);

    if (effectivePlan !== "business") {
      setBusinessStats(null);
      return;
    }
    const listingIds = userListings.map((l) => l.id);

    let totalFavoritesCount = 0;
    if (listingIds.length > 0) {
      const { count } = await supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .in("listing_id", listingIds);
      totalFavoritesCount = count || 0;
    }

    const totalViews = userListings.reduce((sum, l) => sum + (l.views_count || 0), 0);
    const activeCount = userListings.filter((l) => l.status === "active").length;
    const soldCount = userListings.filter((l) => l.status === "sold").length;
    const topListings = [...userListings]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 5)
      .map((l) => ({ id: l.id, title: l.title, views: l.views_count || 0 }));

    setBusinessStats({
      totalViews,
      totalFavorites: totalFavoritesCount,
      totalListings: userListings.length,
      activeListings: activeCount,
      soldListings: soldCount,
      avgViewsPerListing: userListings.length > 0 ? Math.round(totalViews / userListings.length) : 0,
      topListings,
    });
  }, [user]);

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

      fetchSubscriptions();

      const channel = supabase
        .channel(`my-account-subscriptions-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_subscriptions",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            await fetchSubscriptions();
            await fetchListings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchSubscriptions]);

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

  const handleDeleteAll = async () => {
    if (!user) return;
    setDeleteAllLoading(true);
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        toast.error("فشل حذف الإعلانات: " + error.message);
      } else {
        toast.success("تم حذف جميع الإعلانات بنجاح");
        setListings([]);
      }
    } finally {
      setDeleteAllLoading(false);
      setShowDeleteAllConfirm(false);
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

  const startEditProfile = () => {
    setEditName(profile?.full_name || "");
    setEditPhone(profile?.phone || "");
    setEditCity(profile?.city || "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName.trim() || null,
          phone: editPhone.trim() || null,
          city: editCity.trim() || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, full_name: editName.trim() || null, phone: editPhone.trim() || null, city: editCity.trim() || null } : prev);
      setIsEditingProfile(false);
      toast.success("تم حفظ المعلومات بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("فشل حفظ المعلومات");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجا");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const publicUrl = await uploadToB2(file, `avatars`, `${user.id}-avatar.${fileExt}`);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : prev);
      toast.success("تم تحديث الصورة بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("فشل رفع الصورة");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast.error("لا يمكن تغيير كلمة المرور بدون بريد إلكتروني");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    setChangingPassword(true);
    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        toast.error("كلمة المرور الحالية غير صحيحة");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      console.error(error);
      toast.error("فشل تغيير كلمة المرور");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "حذف حسابي") {
      toast.error("يرجى كتابة 'حذف حسابي' للتأكيد");
      return;
    }
    setDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      await supabase.auth.signOut({ scope: "global" });
      toast.success("تم حذف حسابك بنجاح وتسجيل الخروج من جميع الأجهزة");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("فشل حذف الحساب");
    } finally {
      setDeletingAccount(false);
    }
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

  const highestListingPlan = getHighestActiveListingPlan(listings);
  const currentSubscription = getEffectiveActiveSubscription(subscriptions);
  const effectivePlan = getHigherPriorityPlan(currentSubscription?.plan_type, highestListingPlan);

  const effectivePlanDurationDays = effectivePlan === "business"
    ? settings.business_listing.duration_days
    : effectivePlan === "professional"
      ? settings.professional_listing.duration_days
      : effectivePlan === "featured"
        ? settings.featured_listing.duration_days
        : settings.free_listing.duration_days;

  const effectiveSubscriptionMatchesRecord = currentSubscription?.plan_type === effectivePlan;

  const activeSubscriptions = effectivePlan !== "free"
    ? [{
        id: currentSubscription?.id || `effective-plan-${effectivePlan}`,
        plan_type: effectivePlan,
        status: "active",
        starts_at: effectiveSubscriptionMatchesRecord
          ? currentSubscription?.starts_at || currentSubscription?.created_at || new Date().toISOString()
          : new Date().toISOString(),
        expires_at: effectiveSubscriptionMatchesRecord
          ? currentSubscription?.expires_at || new Date(Date.now() + effectivePlanDurationDays * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + effectivePlanDurationDays * 24 * 60 * 60 * 1000).toISOString(),
        created_at: effectiveSubscriptionMatchesRecord
          ? currentSubscription?.created_at || new Date().toISOString()
          : new Date().toISOString(),
      }]
    : [];
  const expiredSubscriptions = subscriptions.filter(
    (s) => s.status !== "active" || new Date(s.expires_at) <= new Date()
  );

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header onListingAdded={fetchListings} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.myAccount.title}</h1>
            <p className="text-muted-foreground mt-1">
              {t.myAccount.subtitle}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={() => navigate("/settings")} variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              {t.myAccount.settingsBtn}
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" size="sm">
              <BackArrow className="h-4 w-4" />
              {t.myAccount.backToHome}
            </Button>
          </div>
        </div>

        {/* Personal Info Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                المعلومات الشخصية
              </h2>
              {!isEditingProfile ? (
                <Button variant="outline" size="sm" onClick={startEditProfile}>
                  <Edit2 className="h-4 w-4" />
                  تعديل
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>
                    <X className="h-4 w-4" />
                    إلغاء
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {uploadingAvatar ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                {isEditingProfile && (
                  <label className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                    <Camera className="h-3.5 w-3.5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                )}
              </div>
              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {isEditingProfile ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> الاسم</label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="الاسم الكامل" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> الهاتف</label>
                      <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="رقم الهاتف" dir="ltr" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><MapPinIcon className="h-3 w-3" /> المدينة</label>
                      <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="المدينة" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">البريد:</span>
                      <span className="font-medium text-foreground" dir="ltr">{user.email || "غير محدد"}</span>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">تاريخ التسجيل:</span>
                  <span className="font-medium text-foreground">{profile ? formatFullDate(profile.created_at) : "—"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Listings Section - Enhanced */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                إعلاناتي
              </h2>
              {listings.length > 0 && (
                <Button variant="destructive" size="sm" onClick={() => setShowDeleteAllConfirm(true)}>
                  <Trash2 className="h-4 w-4" />
                  حذف الكل
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            {!loading && listings.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{listingStats.total}</p>
                  <p className="text-xs text-muted-foreground">الكل</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{listingStats.active}</p>
                  <p className="text-xs text-muted-foreground">نشط</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-destructive">{listingStats.sold}</p>
                  <p className="text-xs text-muted-foreground">مباع</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-muted-foreground">{listingStats.expired}</p>
                  <p className="text-xs text-muted-foreground">منتهي</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-primary">{listingStats.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">مشاهدات</p>
                </div>
              </div>
            )}

            {/* Tabs + Search */}
            {!loading && listings.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
                <Tabs value={listingTab} onValueChange={setListingTab} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                    <TabsTrigger value="all">الكل ({listingStats.total})</TabsTrigger>
                    <TabsTrigger value="active">نشط ({listingStats.active})</TabsTrigger>
                    <TabsTrigger value="sold">مباع ({listingStats.sold})</TabsTrigger>
                    <TabsTrigger value="expired">منتهي ({listingStats.expired})</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث في إعلاناتك..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
            )}

            {/* Listing Cards */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t.myAccount.noListings}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t.myAccount.noListingsDesc}
                </p>
                <Button onClick={() => setAddListingModalOpen(true)}>
                  {t.myAccount.addNewListing}
                </Button>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <Search className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">لا توجد إعلانات مطابقة للبحث</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-card">
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
                            <Badge variant={statusLabels[listing.status || "active"]?.variant || "default"} className={statusLabels[listing.status || "active"]?.className}>
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
                              {formatPrice(listing.price, listing.country ? getCountryByName(listing.country).currencySymbol : undefined)}
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
                                    {t.myAccount.markAsSold}
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
                  </div>
                ))}
              </div>
            )}
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


        {businessStats && (
          <Card className="mb-8 border-blue-500/30">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                إحصائيات متقدمة
                <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 text-xs"><Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 text-xs">💎 رجال أعمال</Badge></Badge>
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Eye className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-foreground">{businessStats.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">إجمالي المشاهدات</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Heart className="h-5 w-5 mx-auto mb-2 text-destructive" />
                  <p className="text-2xl font-bold text-foreground">{businessStats.totalFavorites}</p>
                  <p className="text-xs text-muted-foreground">في المفضلة</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-foreground">{businessStats.avgViewsPerListing}</p>
                  <p className="text-xs text-muted-foreground">متوسط المشاهدات</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Pin className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-foreground">{businessStats.totalListings}</p>
                  <p className="text-xs text-muted-foreground">إجمالي الإعلانات</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-foreground">{businessStats.activeListings}</p>
                  <p className="text-xs text-muted-foreground">إعلانات نشطة</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <BarChart3 className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold text-foreground">{businessStats.soldListings}</p>
                  <p className="text-xs text-muted-foreground">تم بيعها</p>
                </div>
              </div>

              {/* Top Listings */}
              {businessStats.topListings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    أكثر الإعلانات مشاهدة
                  </h3>
                  <div className="space-y-2">
                    {businessStats.topListings.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/listing/${item.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground w-6">{idx + 1}.</span>
                          <span className="text-sm font-medium text-foreground line-clamp-1">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{item.views.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Password Change Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                تغيير كلمة المرور
              </h2>
              {!showPasswordForm && (
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
                  <Edit2 className="h-4 w-4" />
                  تغيير
                </Button>
              )}
            </div>
            {showPasswordForm ? (
              <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">كلمة المرور الحالية</label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="أدخل كلمة المرور الحالية" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">كلمة المرور الجديدة</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">تأكيد كلمة المرور الجديدة</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="أعد إدخال كلمة المرور الجديدة" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ كلمة المرور
                  </Button>
                  <Button variant="outline" onClick={() => { setShowPasswordForm(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}>
                    <X className="h-4 w-4" />
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">يمكنك تغيير كلمة المرور الخاصة بحسابك من هنا</p>
            )}
          </CardContent>
        </Card>

        {/* Delete Account Section */}
        <Card className="mb-8 border-destructive/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-destructive flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" />
              حذف الحساب
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              سيؤدي حذف حسابك إلى إزالة جميع بياناتك بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </p>
            {!showDeleteConfirm ? (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4" />
                حذف حسابي
              </Button>
            ) : (
              <div className="space-y-3 max-w-md border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                <p className="text-sm font-medium text-foreground">
                  اكتب <span className="font-bold text-destructive">"حذف حسابي"</span> للتأكيد:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="حذف حسابي"
                  className="border-destructive/30"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || deleteConfirmText !== "حذف حسابي"}
                  >
                    {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    تأكيد الحذف
                  </Button>
                  <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Add Listing Modal */}
      <AddListingModal
        isOpen={addListingModalOpen}
        onClose={() => setAddListingModalOpen(false)}
        onSuccess={() => {
          setAddListingModalOpen(false);
          fetchListings();
        }}
      />


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

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف جميع الإعلانات</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف جميع إعلاناتك؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAllLoading}
            >
              {deleteAllLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف الكل"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyAccount;
