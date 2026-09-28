import { useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomPlans, type CustomPlan, type BaseTier } from "@/lib/customPlans";

const TIERS: { key: BaseTier; label: string }[] = [
  { key: "featured", label: "مميز" },
  { key: "professional", label: "احترافي" },
  { key: "business", label: "رجال الأعمال" },
];

type Draft = Omit<CustomPlan, "id" | "plan_key"> & { id?: string };

const empty: Draft = {
  base_tier: "featured", name_ar: "", name_en: "", name_tr: "",
  features_ar: "", features_en: "", features_tr: "",
  price: 0, duration_days: 30, max_active_listings: 10, max_images: 10,
  reward_cost: 0, color: "#f97316", glow_color2: "#fb923c", display_order: 0, is_active: true,
};

const AdminPlansTab = () => {
  const { plans, refetch } = useCustomPlans();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  const save = async () => {
    if (!draft) return;
    if (!draft.name_ar.trim()) return toast.error("اكتب اسم الباقة بالعربية");
    if (draft.duration_days <= 0) return toast.error("المدة يجب أن تكون أكبر من صفر");
    setSaving(true);
    const { id, ...row } = draft;
    const { error } = id
      ? await supabase.from("custom_plans").update(row).eq("id", id)
      : await supabase.from("custom_plans").insert(row);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ الباقة");
    setDraft(null);
    refetch();
  };

  const remove = async (p: CustomPlan) => {
    if (!confirm(`حذف باقة «${p.name_ar}»؟ الاشتراكات الحالية ستفقد مزاياها. يُفضّل إيقافها بدل الحذف.`)) return;
    const { error } = await supabase.from("custom_plans").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    refetch();
  };

  const toggle = async (p: CustomPlan, v: boolean) => {
    const { error } = await supabase.from("custom_plans").update({ is_active: v }).eq("id", p.id);
    if (error) return toast.error(error.message);
    refetch();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">الباقات الإضافية</h2>
          <p className="text-sm text-muted-foreground">أضف باقات جديدة بسعرها ومدتها وحدودها. الباقات الثلاث الأساسية تُعدّل من الإعدادات.</p>
        </div>
        <Button onClick={() => setDraft({ ...empty })}><Plus className="h-4 w-4" />باقة جديدة</Button>
      </div>

      {plans.length === 0 && <Card><CardContent className="p-6 text-center text-muted-foreground">لا توجد باقات إضافية بعد</CardContent></Card>}

      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((p) => (
          <Card key={p.id} style={{ borderColor: p.color, borderWidth: 2 }}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold">{p.name_ar}</p>
                <Switch checked={p.is_active} onCheckedChange={(v) => toggle(p, v)} />
              </div>
              <p className="text-xs text-muted-foreground">{p.name_en} · {p.name_tr}</p>
              <div className="text-sm grid grid-cols-2 gap-1" dir="rtl">
                <span>السعر: <b dir="ltr">{Number(p.price).toLocaleString("en-US")}</b></span>
                <span>المدة: <b dir="ltr">{p.duration_days}</b> يوم</span>
                <span>الإعلانات: <b dir="ltr">{p.max_active_listings < 0 ? "∞" : p.max_active_listings}</b></span>
                <span>الصور: <b dir="ltr">{p.max_images}</b></span>
                <span>المزايا: {TIERS.find((t) => t.key === p.base_tier)?.label}</span>
                <span>النقاط: <b dir="ltr">{p.reward_cost || "—"}</b></span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setDraft({ ...p })}><Pencil className="h-4 w-4" />تعديل</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => remove(p)}><Trash2 className="h-4 w-4" />حذف</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{draft?.id ? "تعديل الباقة" : "باقة جديدة"}</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>الاسم بالعربية</Label><Input value={draft.name_ar} onChange={(e) => set("name_ar", e.target.value)} />
                <Label>الاسم بالإنجليزية</Label><Input dir="ltr" value={draft.name_en} onChange={(e) => set("name_en", e.target.value)} />
                <Label>الاسم بالتركية</Label><Input dir="ltr" value={draft.name_tr} onChange={(e) => set("name_tr", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>السعر</Label><Input type="number" dir="ltr" value={draft.price} onChange={(e) => set("price", num(e.target.value))} /></div>
                <div><Label>المدة (أيام)</Label><Input type="number" dir="ltr" value={draft.duration_days} onChange={(e) => set("duration_days", num(e.target.value))} /></div>
                <div><Label>عدد الإعلانات (-1 بلا حد)</Label><Input type="number" dir="ltr" value={draft.max_active_listings} onChange={(e) => set("max_active_listings", num(e.target.value))} /></div>
                <div><Label>عدد الصور</Label><Input type="number" dir="ltr" value={draft.max_images} onChange={(e) => set("max_images", num(e.target.value))} /></div>
                <div><Label>نقاط الاستبدال (0 = لا)</Label><Input type="number" dir="ltr" value={draft.reward_cost} onChange={(e) => set("reward_cost", num(e.target.value))} /></div>
                <div><Label>الترتيب</Label><Input type="number" dir="ltr" value={draft.display_order} onChange={(e) => set("display_order", num(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <Label>الشارة والتوهج والأولوية مثل</Label>
                  <Select value={draft.base_tier} onValueChange={(v) => set("base_tier", v as BaseTier)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIERS.map((t) => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>لون التوهج الأول</Label><Input type="color" value={draft.color} onChange={(e) => set("color", e.target.value)} className="h-10 p-1" /></div>
                <div><Label>لون التوهج الثاني</Label><Input type="color" value={draft.glow_color2} onChange={(e) => set("glow_color2", e.target.value)} className="h-10 p-1" /></div>
              </div>
              <div className="grid gap-2">
                <Label>المزايا بالعربية (سطر لكل ميزة)</Label><Textarea rows={3} value={draft.features_ar} onChange={(e) => set("features_ar", e.target.value)} />
                <Label>المزايا بالإنجليزية</Label><Textarea rows={3} dir="ltr" value={draft.features_en} onChange={(e) => set("features_en", e.target.value)} />
                <Label>المزايا بالتركية</Label><Textarea rows={3} dir="ltr" value={draft.features_tr} onChange={(e) => set("features_tr", e.target.value)} />
              </div>
              <div className="flex items-center gap-2"><Switch checked={draft.is_active} onCheckedChange={(v) => set("is_active", v)} /><span>مفعّلة وتظهر للمستخدمين</span></div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlansTab;
