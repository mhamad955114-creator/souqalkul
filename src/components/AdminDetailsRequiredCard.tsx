import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const KEY = "listing_details_required";

const AdminDetailsRequiredCard = () => {
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("listing_settings").select("setting_value").eq("setting_key", KEY).maybeSingle()
      .then(({ data }) => setEnabled((data?.setting_value as any)?.enabled !== false));
  }, []);

  const save = async (v: boolean) => {
    setSaving(true);
    setEnabled(v);
    const value = { enabled: v } as any;
    const { data, error } = await supabase.from("listing_settings")
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq("setting_key", KEY).select("id");
    let err = error;
    if (!err && (!data || data.length === 0)) {
      err = (await supabase.from("listing_settings").insert({ setting_key: KEY, setting_value: value })).error;
    }
    if (err) { setEnabled(!v); toast.error("فشل الحفظ"); }
    else toast.success(v ? "تفاصيل الإعلان أصبحت إجبارية" : "تفاصيل الإعلان أصبحت اختيارية");
    setSaving(false);
  };

  return (
    <Card className="border-primary/30">
      <CardContent className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ListChecks className="h-5 w-5 text-primary" />
          <div>
            <p className="font-bold">تفاصيل الإعلان إجبارية</p>
            <p className="text-sm text-muted-foreground">عند الإيقاف يستطيع المستخدم نشر الإعلان بدون تعبئة التفاصيل</p>
          </div>
        </div>
        <Switch checked={enabled} disabled={saving} onCheckedChange={save} />
      </CardContent>
    </Card>
  );
};

export default AdminDetailsRequiredCard;
