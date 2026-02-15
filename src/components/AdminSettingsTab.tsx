import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Gift, Star, Crown, Heart, Construction, Banknote } from "lucide-react";
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
    key: "dating_listing",
    label: "إعلان التعارف",
    icon: Heart,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-500/10",
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

  useEffect(() => {
    const fetchExtraSettings = async () => {
      const { data } = await supabase
        .from("listing_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["maintenance_mode", "shamcash_account"]);
      if (data) {
        data.forEach((row: any) => {
          if (row.setting_key === "maintenance_mode") {
            const val = row.setting_value as any;
            setMaintenanceEnabled(val.enabled ?? false);
            setMaintenanceMessage(val.message ?? "");
          }
          if (row.setting_key === "shamcash_account") {
            setShamcashAccount(String(row.setting_value).replace(/"/g, "") || "0999999999");
          }
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
        dating_listing: { ...settings.dating_listing },
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
    const { error } = await supabase
      .from("listing_settings")
      .update({ setting_value: { enabled: maintenanceEnabled, message: maintenanceMessage } as any })
      .eq("setting_key", "maintenance_mode");
    if (!error) {
      toast.success("تم حفظ إعدادات الصيانة");
    } else {
      toast.error("فشل حفظ إعدادات الصيانة");
    }
    setSavingMaintenance(false);
  };

  const handleSaveShamcash = async () => {
    setSavingShamcash(true);
    const { error } = await supabase
      .from("listing_settings")
      .update({ setting_value: shamcashAccount as any })
      .eq("setting_key", "shamcash_account");
    if (!error) {
      toast.success("تم حفظ رقم شام كاش");
    } else {
      toast.error("فشل حفظ رقم شام كاش");
    }
    setSavingShamcash(false);
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
      {/* ShamCash Account Card */}
      <Card className="border-primary/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">رقم حساب شام كاش</h3>
          </div>

          <div className="space-y-2">
            <Label>رقم الحساب الذي يظهر للمستخدمين عند شحن المحفظة</Label>
            <Input
              value={shamcashAccount}
              onChange={(e) => setShamcashAccount(e.target.value)}
              placeholder="0999999999"
              dir="ltr"
              className="text-left font-mono"
            />
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleSaveShamcash}
            disabled={savingShamcash}
          >
            {savingShamcash ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ رقم شام كاش
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
