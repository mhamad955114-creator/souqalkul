import { useEffect, useState } from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  DEFAULT_GLOW, normalizeGlow, setGlowCache, glowOuterStyle, glowInnerStyle,
  type GlowConfig, type GlowPlan,
} from "@/hooks/useBadgeGlow";

const PLANS: { key: GlowPlan; label: string }[] = [
  { key: "featured", label: "إعلان مميز" },
  { key: "professional", label: "احترافي" },
  { key: "business", label: "رجال الأعمال" },
];

const AdminBadgeGlowTab = () => {
  const [cfg, setCfg] = useState<GlowConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.rpc("get_badge_glow_config").then(({ data }) => setCfg(normalizeGlow(data)));
  }, []);

  const update = (plan: GlowPlan, patch: Partial<GlowConfig[GlowPlan]>) =>
    setCfg((c) => (c ? { ...c, [plan]: { ...c[plan], ...patch } } : c));

  const save = async () => {
    if (!cfg) return;
    setSaving(true);
    const { error } = await supabase.rpc("admin_set_badge_glow_config", { _config: cfg as never });
    setSaving(false);
    if (error) return toast.error(error.message);
    setGlowCache(cfg);
    toast.success("تم حفظ إعدادات التوهج");
  };

  if (!cfg) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5" dir="rtl">
      {PLANS.map(({ key, label }) => {
        const g = cfg[key];
        return (
          <Card key={key}><CardContent className="p-5">
            <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{label}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{g.enabled ? "التوهج مفعّل" : "بدون توهج"}</span>
                    <Switch checked={g.enabled} onCheckedChange={(v) => update(key, { enabled: v })} />
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-sm">اللون الأساسي
                    <input type="color" value={g.color} onChange={(e) => update(key, { color: e.target.value })} className="h-9 w-12 rounded border border-border bg-transparent" />
                  </label>
                  <label className="flex items-center gap-2 text-sm">اللون الثاني
                    <input type="color" value={g.color2} onChange={(e) => update(key, { color2: e.target.value })} className="h-9 w-12 rounded border border-border bg-transparent" />
                  </label>
                </div>
                <div className="space-y-2">
                  <span className="text-sm">قوة التوهج: <span dir="ltr">{g.intensity}</span></span>
                  <Slider min={1} max={10} step={1} value={[g.intensity]} onValueChange={([v]) => update(key, { intensity: v })} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant={g.style === "soft" ? "default" : "outline"} onClick={() => update(key, { style: "soft" })}>توهج ناعم</Button>
                  <Button size="sm" variant={g.style === "neon" ? "default" : "outline"} onClick={() => update(key, { style: "neon" })}>إطار نيون</Button>
                  <label className="flex items-center gap-2 text-sm ms-2">
                    <Switch checked={g.animate} onCheckedChange={(v) => update(key, { animate: v })} /> نبض متحرك
                  </label>
                </div>
              </div>
              <div className="relative aspect-[4/6] rounded-2xl bg-muted overflow-visible" style={g.enabled ? glowOuterStyle(g) : undefined}>
                <div className="absolute inset-0 rounded-2xl bg-foreground/90" />
                {g.enabled && glowInnerStyle(g) && (
                  <div className={`absolute inset-0 rounded-2xl ${g.animate ? "animate-pulse" : ""}`} style={glowInnerStyle(g)} />
                )}
                <span className="absolute bottom-2 inset-x-0 text-center text-xs text-background">معاينة</span>
              </div>
            </div>
          </CardContent></Card>
        );
      })}
      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}حفظ</Button>
        <Button variant="outline" onClick={() => setCfg(DEFAULT_GLOW)}><RotateCcw className="h-4 w-4" />الافتراضي</Button>
      </div>
    </div>
  );
};

export default AdminBadgeGlowTab;
