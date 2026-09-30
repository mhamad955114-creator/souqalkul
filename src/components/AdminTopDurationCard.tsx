import { useEffect, useState } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_TOP_DURATION, loadTopDuration, setTopDurationCache, type TopDurationConfig } from "@/lib/listingPriority";

const PLANS: { key: keyof TopDurationConfig; label: string }[] = [
  { key: "featured", label: "إعلان مميز" },
  { key: "professional", label: "احترافي" },
  { key: "business", label: "رجال الأعمال" },
];

const AdminTopDurationCard = () => {
  const [cfg, setCfg] = useState<TopDurationConfig>(DEFAULT_TOP_DURATION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTopDuration(true).then((c) => { setCfg(c); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase.rpc as any)("admin_set_top_duration_config", { _config: cfg });
    setSaving(false);
    if (error) return toast.error("تعذر الحفظ");
    setTopDurationCache(cfg);
    toast.success("تم حفظ مدة الظهور في الأعلى");
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 font-bold">
          <Clock className="h-5 w-5 text-primary" />
          مدة ظهور الإعلان في أول الإعلانات
        </div>
        <p className="text-xs text-muted-foreground">
          عدد الساعات التي يبقى فيها إعلان الباقة في الأعلى بعد تفعيلها. بعدها يعود لترتيبه العادي (تبقى الشارة والتوهج). 0 = بدون حد.
        </p>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {PLANS.map((p) => (
              <label key={p.key} className="space-y-1 text-sm">
                <span>{p.label} (ساعة)</span>
                <Input
                  type="number"
                  min={0}
                  value={cfg[p.key]}
                  onChange={(e) => setCfg({ ...cfg, [p.key]: Math.max(0, parseInt(e.target.value) || 0) })}
                />
              </label>
            ))}
          </div>
        )}
        <Button onClick={save} disabled={saving || loading} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminTopDurationCard;
