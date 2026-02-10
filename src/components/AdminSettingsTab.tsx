import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Gift, Star, Crown } from "lucide-react";
import { toast } from "sonner";
import { useListingSettings, ListingPlan } from "@/hooks/useListingSettings";
import { formatPrice } from "@/lib/constants";

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
];

const AdminSettingsTab = () => {
  const { settings, loading, updateSetting } = useListingSettings();
  const [editValues, setEditValues] = useState<Record<string, ListingPlan>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      setEditValues({
        free_listing: { ...settings.free_listing },
        featured_listing: { ...settings.featured_listing },
        professional_listing: { ...settings.professional_listing },
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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
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
  );
};

export default AdminSettingsTab;
