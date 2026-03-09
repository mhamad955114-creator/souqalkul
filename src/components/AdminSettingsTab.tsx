import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Gift, Star, Crown, Heart, Construction, Wallet, Briefcase, Phone, Share2, Facebook, Instagram, Twitter, Youtube, Palette } from "lucide-react";
import { toast } from "sonner";
import { useListingSettings, ListingPlan } from "@/hooks/useListingSettings";
import { formatPrice } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const planConfig = [
  {
    key: "free_listing",
    label: "الإعلان المجاني",
    icon: Gift,
    iconColor: "text-green-500",
    bgColor: "bg-green-500/10",
    hasPrice: false,
  },
  {
    key: "featured_listing",
    label: "الإعلان المميز",
    icon: Star,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    hasPrice: true,
  },
  {
    key: "professional_listing",
    label: "الإعلان الاحترافي",
    icon: Crown,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    hasPrice: true,
  },
  {
    key: "business_listing",
    label: "باقة رجال الأعمال",
    icon: Briefcase,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    hasPrice: true,
  },
];

const AdminSettingsTab = () => {
  const { settings, loading, updateSetting } = useListingSettings();
  const [editValues, setEditValues] = useState<Record<string, ListingPlan>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("الموقع تحت الصيانة حالياً، سنعود قريباً!");
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [shamcashAccount, setShamcashAccount] = useState("0999999999");
  const [savingShamcash, setSavingShamcash] = useState(false);

  const [contactEmail, setContactEmail] = useState("suopalkul5@gmail.com");
  const [contactPhone, setContactPhone] = useState("+905350348850");
  const [contactLocation, setContactLocation] = useState("Damascus, Syria");
  const [contactWhatsapp, setContactWhatsapp] = useState("+905350348850");
  const [savingContact, setSavingContact] = useState(false);

  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialSnapchat, setSocialSnapchat] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");
  const [savingSocial, setSavingSocial] = useState(false);

  // Theme colors
  const [primaryColor, setPrimaryColor] = useState("#ff6b35");
  const [secondaryColor, setSecondaryColor] = useState("#f5f5f5");
  const [accentColor, setAccentColor] = useState("#2d8f78");
  const [savingTheme, setSavingTheme] = useState(false);

  const normalizeText = (val: unknown, fallback: string) => {
    if (val == null) return fallback;
    if (typeof val === "string") return val || fallback;
    const asJson = JSON.stringify(val);
    return asJson.replace(/^\"|\"$/g, "") || fallback;
  };

  const upsertSetting = async (setting_key: string, setting_value: any) => {
    const { data, error } = await supabase
      .from("listing_settings")
      .update({ setting_value: setting_value as any, updated_at: new Date().toISOString() })
      .eq("setting_key", setting_key)
      .select("id")
      .limit(1);

    if (error) return { error };
    if (!data || data.length === 0) {
      return await supabase
        .from("listing_settings")
        .insert({ setting_key, setting_value: setting_value as any });
    }

    return { error: null };
  };

  useEffect(() => {
    const fetchExtraSettings = async () => {
      const { data } = await supabase
        .from("listing_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "maintenance_mode",
          "shamcash_account",
          "contact_email",
          "contact_phone",
          "contact_location",
          "contact_whatsapp",
          "social_facebook",
          "social_instagram",
          "social_twitter",
          "social_snapchat",
          "social_youtube",
          "social_tiktok",
          "theme_primary",
          "theme_secondary", 
          "theme_accent",
        ]);

      if (data) {
        data.forEach((row: any) => {
          if (row.setting_key === "maintenance_mode") {
            const val = row.setting_value as any;
            setMaintenanceEnabled(val.enabled ?? false);
            setMaintenanceMessage(val.message ?? "");
          }
          if (row.setting_key === "shamcash_account") {
            setShamcashAccount(normalizeText(row.setting_value, "0999999999"));
          }
          if (row.setting_key === "contact_email") {
            setContactEmail(normalizeText(row.setting_value, "suopalkul5@gmail.com"));
          }
          if (row.setting_key === "contact_phone") {
            setContactPhone(normalizeText(row.setting_value, "+905350348850"));
          }
          if (row.setting_key === "contact_location") {
            setContactLocation(normalizeText(row.setting_value, "Damascus, Syria"));
          }
          if (row.setting_key === "contact_whatsapp") {
            setContactWhatsapp(normalizeText(row.setting_value, "+905350348850"));
          }
          if (row.setting_key === "social_facebook") setSocialFacebook(normalizeText(row.setting_value, ""));
          if (row.setting_key === "social_instagram") setSocialInstagram(normalizeText(row.setting_value, ""));
          if (row.setting_key === "social_twitter") setSocialTwitter(normalizeText(row.setting_value, ""));
          if (row.setting_key === "social_snapchat") setSocialSnapchat(normalizeText(row.setting_value, ""));
          if (row.setting_key === "social_youtube") setSocialYoutube(normalizeText(row.setting_value, ""));
          if (row.setting_key === "social_tiktok") setSocialTiktok(normalizeText(row.setting_value, ""));
        });
      }
    };

    fetchExtraSettings();
  }, []);

  useEffect(() => {
    if (!loading) {
      setEditValues({
        free_listing: { ...settings.free_listing },
        featured_listing: { ...settings.featured_listing },
        professional_listing: { ...settings.professional_listing },
        business_listing: { ...settings.business_listing },
      });
    }
  }, [loading, settings]);

  const handleSave = async (key: string) => {
    setSaving(key);
    const success = await updateSetting(key, editValues[key]);
    if (success) {
      toast.success("تم حفظ الإعدادات بنجاح");
    } else {
      toast.error("فشل حفظ الإعدادات");
    }
    setSaving(null);
  };

  const updateField = (key: string, field: keyof ListingPlan, value: number) => {
    setEditValues((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSaveMaintenance = async () => {
    setSavingMaintenance(true);
    const { error } = await upsertSetting(
      "maintenance_mode",
      { enabled: maintenanceEnabled, message: maintenanceMessage } as any
    );

    if (!error) {
      toast.success("تم حفظ إعدادات الصيانة");
    } else {
      toast.error("فشل حفظ إعدادات الصيانة");
    }
    setSavingMaintenance(false);
  };

  const handleSaveShamcash = async () => {
    setSavingShamcash(true);
    const { error } = await upsertSetting("shamcash_account", shamcashAccount as any);

    if (!error) {
      toast.success("تم حفظ رقم شام كاش");
    } else {
      toast.error("فشل حفظ رقم شام كاش");
    }
    setSavingShamcash(false);
  };

  const handleSaveContact = async () => {
    setSavingContact(true);

    const results = await Promise.all([
      upsertSetting("contact_email", contactEmail as any),
      upsertSetting("contact_phone", contactPhone as any),
      upsertSetting("contact_location", contactLocation as any),
      upsertSetting("contact_whatsapp", contactWhatsapp as any),
    ]);

    const hasError = results.some((r) => !!(r as any).error);

    if (!hasError) {
      toast.success("تم حفظ بيانات التواصل");
    } else {
      toast.error("فشل حفظ بيانات التواصل");
    }

    setSavingContact(false);
  };

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    const results = await Promise.all([
      upsertSetting("social_facebook", socialFacebook as any),
      upsertSetting("social_instagram", socialInstagram as any),
      upsertSetting("social_twitter", socialTwitter as any),
      upsertSetting("social_snapchat", socialSnapchat as any),
      upsertSetting("social_youtube", socialYoutube as any),
      upsertSetting("social_tiktok", socialTiktok as any),
    ]);
    const hasError = results.some((r) => !!(r as any).error);
    if (!hasError) {
      toast.success("تم حفظ روابط التواصل الاجتماعي");
    } else {
      toast.error("فشل حفظ روابط التواصل الاجتماعي");
    }
    setSavingSocial(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact Settings */}
      <Card className="border-primary/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">بيانات التواصل</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>إيميل التواصل</Label>
              <Input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+905..."
                dir="ltr"
                className="text-left font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>رقم WhatsApp</Label>
              <Input
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="+905..."
                dir="ltr"
                className="text-left font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Input
                value={contactLocation}
                onChange={(e) => setContactLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          <Button className="w-full gap-2" onClick={handleSaveContact} disabled={savingContact}>
            {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ بيانات التواصل
          </Button>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card className="border-primary/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">روابط التواصل الاجتماعي</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-500" />
                Facebook
              </Label>
              <Input
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                dir="ltr"
                className="text-left text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-500" />
                Instagram
              </Label>
              <Input
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="https://instagram.com/yourpage"
                dir="ltr"
                className="text-left text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Twitter className="h-4 w-4 text-sky-500" />
                Twitter / X
              </Label>
              <Input
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="https://twitter.com/yourpage"
                dir="ltr"
                className="text-left text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.246.133-.065.262-.089.397-.089.345 0 .628.211.735.39.089.151.135.39-.074.614-.196.21-.533.39-.838.502-.307.115-.632.193-.903.246-.145.03-.287.045-.374.06l-.006.001c-.052.009-.091.015-.122.024-.09.03-.193.09-.24.21a.67.67 0 0 0-.015.39c.473 1.545 1.47 2.749 2.422 3.315.256.149.48.27.556.39.18.285.03.63-.15.81-.255.24-.616.42-.988.555-.485.18-.965.27-1.455.36-.18.03-.285.15-.33.27-.045.12-.06.27-.09.42-.045.195-.09.39-.225.555-.18.21-.48.315-.795.315-.195 0-.42-.045-.66-.105-.36-.09-.81-.21-1.395-.21-.27 0-.555.03-.84.09-.795.18-1.41.72-2.07 1.305-.42.375-.855.75-1.395 1.02-.255.12-.54.21-.84.21s-.585-.09-.84-.21c-.54-.27-.975-.645-1.395-1.02-.66-.585-1.275-1.125-2.07-1.305a4.14 4.14 0 0 0-.84-.09c-.585 0-1.035.12-1.395.21-.24.06-.465.105-.66.105-.315 0-.615-.105-.795-.315-.135-.165-.18-.36-.225-.555-.03-.15-.045-.3-.09-.42-.045-.12-.15-.24-.33-.27-.49-.09-.97-.18-1.455-.36-.375-.135-.735-.315-.99-.555-.18-.18-.33-.525-.15-.81.075-.12.3-.24.555-.39.955-.565 1.95-1.77 2.425-3.315a.67.67 0 0 0-.015-.39c-.045-.12-.15-.18-.24-.21-.03-.009-.07-.015-.12-.024l-.007-.001c-.087-.015-.229-.03-.374-.06-.27-.053-.596-.131-.903-.246-.305-.113-.642-.292-.838-.503-.209-.224-.163-.463-.074-.614.107-.179.39-.39.735-.39.135 0 .264.024.397.09.265.126.622.233.922.246.197 0 .326-.045.4-.09a43.33 43.33 0 0 1-.032-.57c-.104-1.628-.23-3.654.3-4.847C7.46 1.07 10.816.793 11.806.793h.4z"/></svg>
                Snapchat
              </Label>
              <Input
                value={socialSnapchat}
                onChange={(e) => setSocialSnapchat(e.target.value)}
                placeholder="https://snapchat.com/add/yourpage"
                dir="ltr"
                className="text-left text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500" />
                YouTube
              </Label>
              <Input
                value={socialYoutube}
                onChange={(e) => setSocialYoutube(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                dir="ltr"
                className="text-left text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.04 4.41-2.61 6.01-1.58 1.61-3.9 2.58-6.2 2.45-2.18-.11-4.29-1.2-5.61-2.91-1.3-1.7-1.83-3.95-1.5-6.08.3-2.07 1.48-4 3.12-5.32 1.62-1.28 3.78-1.89 5.86-1.66v4.06c-1.17-.3-2.51-.12-3.48.65-.96.76-1.48 2.01-1.32 3.2.14 1.25.99 2.37 2.12 2.89 1.12.51 2.5.49 3.55-.17 1.05-.66 1.66-1.87 1.69-3.13.06-4.52.02-9.05.03-13.57.01-1.07.01-2.14.01-3.21Z"/></svg>
                TikTok
              </Label>
              <Input
                value={socialTiktok}
                onChange={(e) => setSocialTiktok(e.target.value)}
                placeholder="https://tiktok.com/@yourpage"
                dir="ltr"
                className="text-left text-sm"
              />
            </div>
          </div>

          <Button className="w-full gap-2" onClick={handleSaveSocial} disabled={savingSocial}>
            {savingSocial ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ روابط التواصل الاجتماعي
          </Button>
        </CardContent>
      </Card>

      {/* Wallet Address for Top-up */}
      <Card className="border-primary/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">عنوان محفظة الشحن</h3>
          </div>

          <div className="space-y-2">
            <Label>عنوان المحفظة الذي يظهر للمستخدمين عند شحن الرصيد</Label>
            <Input
              value={shamcashAccount}
              onChange={(e) => setShamcashAccount(e.target.value)}
              placeholder="أدخل عنوان المحفظة"
              dir="ltr"
              className="text-left font-mono text-sm"
            />
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleSaveShamcash}
            disabled={savingShamcash}
          >
            {savingShamcash ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ عنوان المحفظة
          </Button>
        </CardContent>
      </Card>

      {/* Maintenance Mode Card */}
      <Card className="border-destructive/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Construction className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground">وضع الصيانة</h3>
          </div>

          <div className="flex items-center justify-between">
            <Label>تفعيل وضع الصيانة</Label>
            <Switch checked={maintenanceEnabled} onCheckedChange={setMaintenanceEnabled} />
          </div>

          <div className="space-y-2">
            <Label>رسالة الصيانة</Label>
            <Textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="الموقع تحت الصيانة..."
              rows={2}
            />
          </div>

          <Button
            className="w-full gap-2"
            variant={maintenanceEnabled ? "destructive" : "default"}
            onClick={handleSaveMaintenance}
            disabled={savingMaintenance}
          >
            {savingMaintenance ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ إعدادات الصيانة
          </Button>

          {maintenanceEnabled && (
            <p className="text-xs text-destructive font-medium">⚠️ وضع الصيانة مفعّل - الموقع غير متاح للزوار حالياً</p>
          )}
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {planConfig.map((plan) => {
        const values = editValues[plan.key];
        if (!values) return null;
        const Icon = plan.icon;

        return (
          <Card key={plan.key} className="relative">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${plan.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{plan.label}</h3>
              </div>

              {plan.hasPrice && (
                <div className="space-y-2">
                  <Label>السعر (ل.س)</Label>
                  <Input
                    type="number"
                    value={values.price || 0}
                    onChange={(e) => updateField(plan.key, "price", Number(e.target.value))}
                    min={0}
                    dir="ltr"
                    className="text-left"
                  />
                  <p className="text-xs text-muted-foreground">{formatPrice(values.price || 0)}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>مدة الإعلان (بالأيام)</Label>
                <Input
                  type="number"
                  value={values.duration_days}
                  onChange={(e) => updateField(plan.key, "duration_days", Number(e.target.value))}
                  min={1}
                  dir="ltr"
                  className="text-left"
                />
              </div>

              <div className="space-y-2">
                <Label>الحد الأقصى للصور</Label>
                <Input
                  type="number"
                  value={values.max_images}
                  onChange={(e) => updateField(plan.key, "max_images", Number(e.target.value))}
                  min={1}
                  dir="ltr"
                  className="text-left"
                />
              </div>

              <div className="space-y-2">
                <Label>الحد الأقصى للإعلانات النشطة</Label>
                <Input
                  type="number"
                  value={values.max_active_listings}
                  onChange={(e) => updateField(plan.key, "max_active_listings", Number(e.target.value))}
                  min={-1}
                  dir="ltr"
                  className="text-left"
                />
                <p className="text-xs text-muted-foreground">-1 = غير محدود</p>
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => handleSave(plan.key)}
                disabled={saving === plan.key}
              >
                {saving === plan.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
};

export default AdminSettingsTab;
