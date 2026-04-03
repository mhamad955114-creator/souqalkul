import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowRight, ArrowLeft, User, Camera, Phone, MapPin, Save, Moon, Sun, Lock, Bell, BellRing, Shield, FileText } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cities } from "@/lib/constants";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { MessageSquare, RefreshCw, Tag, ShieldAlert, Smartphone } from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
}

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        toast.error(t.settings.loadError);
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setAvatarUrl(data.avatar_url || "");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t.settings.invalidImage);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t.settings.imageTooLarge);
      return;
    }

    setUploading(true);
    try {
      // Compress avatar before upload
      const compressedFile = await compressImage(file);
      const fileExt = compressedFile.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listings")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("listings")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast.success(t.settings.uploadSuccess);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(t.settings.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const validatePhone = (value: string): boolean => {
    if (!value) return true;
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(value);
  };

  const handleSave = async () => {
    if (!user) return;

    if (phone && !validatePhone(phone)) {
      toast.error(t.settings.phoneError);
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: fullName || null,
        phone: phone || null,
        city: city || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      if (profile) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert(profileData);

        if (error) throw error;
      }

      toast.success(t.settings.saveSuccess);
      fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(t.settings.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error(t.settings.currentPasswordRequired);
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t.settings.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t.settings.passwordMismatch);
      return;
    }

    setChangingPassword(true);
    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      });

      if (signInError) {
        toast.error(t.settings.currentPasswordRequired);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success(t.settings.passwordSuccess);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || t.settings.passwordError);
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const NotificationPreferencesCard = () => {
    const { preferences, loading: prefsLoading, saving: prefsSaving, updatePreference } = useNotificationPreferences();
    const { isAdmin } = useAdminRole();

    if (prefsLoading) return null;

    const items: { key: "messages" | "updates" | "offers" | "admin_alerts"; label: string; desc: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
      { key: "messages", label: "الرسائل", desc: "إشعارات الرسائل الجديدة في المحادثات", icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
      { key: "updates", label: "التحديثات", desc: "إشعارات تحديثات الإعلانات وحالة البيع", icon: <RefreshCw className="h-4 w-4 text-muted-foreground" /> },
      { key: "offers", label: "العروض", desc: "إشعارات العروض والباقات", icon: <Tag className="h-4 w-4 text-muted-foreground" /> },
      { key: "admin_alerts", label: "تنبيهات الإدارة", desc: "إشعارات البلاغات ورسائل التواصل الجديدة", icon: <ShieldAlert className="h-4 w-4 text-muted-foreground" />, adminOnly: true },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            تفضيلات الإشعارات
          </CardTitle>
          <CardDescription>
            اختر أنواع الإشعارات التي تريد تلقيها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[item.key]}
                  onCheckedChange={(checked) => updatePreference(item.key, checked)}
                  disabled={prefsSaving}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const PushNotificationCard = () => {
    const { isSubscribed, isSupported, isIOSPWA, permission, loading: pushLoading, subscribe, unsubscribe } = usePushNotifications();

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;

    // Show iOS guidance if on iOS but not in PWA or not supported
    if (isIOS && !isStandalone) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              الإشعارات الفورية (Push)
            </CardTitle>
            <CardDescription>
              تلقّي إشعارات حتى عندما يكون التطبيق مغلقاً
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-accent/50 border border-border rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">📱 لتفعيل الإشعارات على iPhone:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>اضغط على زر المشاركة <span className="inline-block">⬆️</span> في Safari</li>
                <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                <li>افتح التطبيق من الشاشة الرئيسية</li>
                <li>فعّل الإشعارات من الإعدادات</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ يتطلب iOS 16.4 أو أحدث وفتح التطبيق كـ PWA
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!isSupported) return null;

    const handleToggle = async (checked: boolean) => {
      if (checked) {
        const success = await subscribe();
        if (success) {
          toast.success("تم تفعيل الإشعارات الفورية");
        } else if (permission === "denied") {
          toast.error("يرجى السماح بالإشعارات من إعدادات المتصفح");
        } else {
          toast.error("فشل في تفعيل الإشعارات");
        }
      } else {
        await unsubscribe();
        toast.success("تم إيقاف الإشعارات الفورية");
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            الإشعارات الفورية (Push)
          </CardTitle>
          <CardDescription>
            تلقّي إشعارات حتى عندما يكون التطبيق مغلقاً
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">تفعيل الإشعارات الفورية</span>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={pushLoading}
            />
          </div>
          {permission === "denied" && (
            <p className="text-xs text-destructive mt-2">
              تم حظر الإشعارات من المتصفح. يرجى تغيير الإعداد من إعدادات المتصفح.
            </p>
          )}
          {isIOSPWA && (
            <p className="text-xs text-muted-foreground mt-1">
              ✅ أنت تستخدم التطبيق كـ PWA - الإشعارات مدعومة على iOS 16.4+
            </p>
          )}
        </CardContent>
      </Card>
    );
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

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.settings.title}</h1>
            <p className="text-muted-foreground mt-1">
              {t.settings.editProfile}
            </p>
          </div>
          <Button onClick={() => navigate("/my-account")} variant="outline">
            <BackArrow className="h-4 w-4" />
            {t.settings.backToListings}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t.settings.profilePicture}
                </CardTitle>
                <CardDescription>
                  {t.settings.profilePictureDesc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl} alt={fullName || "User"} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {getInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{t.settings.clickToChange}</p>
                    <p>{t.settings.maxSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.personalInfo}</CardTitle>
                <CardDescription>
                  {t.settings.basicInfo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.settings.emailCantChange}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.settings.fullName}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t.settings.fullNamePlaceholder}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {t.settings.contactInfo}
                </CardTitle>
                <CardDescription>
                  {t.settings.contactInfoDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.settings.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.settings.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className={dir === "rtl" ? "text-right" : "text-left"}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.settings.phoneHint}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t.settings.location}
                </CardTitle>
                <CardDescription>
                  {t.settings.locationDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t.settings.city}</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.settings.selectCity} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t.settings.changePassword}
                </CardTitle>
                <CardDescription>
                  {t.settings.changePasswordDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t.settings.currentPassword}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder={t.settings.currentPasswordPlaceholder}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.settings.newPassword}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder={t.settings.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.settings.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t.settings.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  variant="outline"
                  className="w-full"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.settings.updatingPassword}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {t.settings.updatePassword}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Theme Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  {t.settings.theme}
                </CardTitle>
                <CardDescription>
                  {t.settings.darkModeDesc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{t.settings.darkMode}</span>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Sound Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  صوت الإشعارات
                </CardTitle>
                <CardDescription>
                  تفعيل أو إيقاف صوت التنبيه عند وصول إشعار جديد
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-foreground">تشغيل صوت الإشعارات</span>
                      <p className="text-xs text-muted-foreground">تشغيل نغمة عند وصول إشعار جديد</p>
                    </div>
                  </div>
                  <Switch
                    checked={localStorage.getItem("notification_sound") !== "off"}
                    onCheckedChange={(checked) => {
                      localStorage.setItem("notification_sound", checked ? "on" : "off");
                      toast.success(checked ? "تم تفعيل صوت الإشعارات" : "تم إيقاف صوت الإشعارات");
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-foreground">اهتزاز الإشعارات</span>
                      <p className="text-xs text-muted-foreground">اهتزاز الجهاز عند وصول إشعار جديد</p>
                    </div>
                  </div>
                  <Switch
                    checked={localStorage.getItem("notification_vibration") !== "off"}
                    onCheckedChange={(checked) => {
                      localStorage.setItem("notification_vibration", checked ? "on" : "off");
                      if (checked && "vibrate" in navigator) {
                        try { navigator.vibrate([100, 50, 100]); } catch (e) {}
                      }
                      toast.success(checked ? "تم تفعيل اهتزاز الإشعارات" : "تم إيقاف اهتزاز الإشعارات");
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications Section */}
            <PushNotificationCard />

            {/* Notification Preferences Section */}
            <NotificationPreferencesCard />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.settings.saving}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t.settings.saveChanges}
                  </>
                )}
              </Button>
            </div>

            {/* Privacy & Terms Links */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <button
                  onClick={() => navigate("/privacy")}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">
                      {dir === "rtl" ? "سياسة الخصوصية" : "Privacy Policy"}
                    </span>
                  </div>
                  {dir === "rtl" ? <ArrowLeft className="h-4 w-4 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={() => navigate("/terms")}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">
                      {dir === "rtl" ? "الشروط والأحكام" : "Terms & Conditions"}
                    </span>
                  </div>
                  {dir === "rtl" ? <ArrowLeft className="h-4 w-4 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
