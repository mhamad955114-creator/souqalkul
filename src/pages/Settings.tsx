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
import { Loader2, ArrowRight, ArrowLeft, User, Camera, Phone, MapPin, Save, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cities } from "@/lib/constants";

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
      const fileExt = file.name.split(".").pop();
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

  const getInitials = (name: string | null): string => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
