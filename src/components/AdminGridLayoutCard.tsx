import { useEffect, useState } from "react";
import { LayoutGrid, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_GRID, loadGridLayout, setGridLayoutCache, type GridLayoutConfig } from "@/hooks/useGridLayout";

const OPTIONS = [2, 3, 4];

const AdminGridLayoutCard = () => {
  const [cfg, setCfg] = useState<GridLayoutConfig>(DEFAULT_GRID);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadGridLayout(true).then((c) => { setCfg(c); setLoading(false); }); }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase.rpc as any)("admin_set_grid_layout_config", { _config: cfg });
    setSaving(false);
    if (error) return toast.error("تعذر الحفظ");
    setGridLayoutCache(cfg);
    toast.success("تم حفظ تخطيط عرض الإعلانات");
  };

  const Row = ({ k, label }: { k: keyof GridLayoutConfig; label: string }) => (
    <div className="space-y-1 text-sm">
      <span>{label}</span>
      <div className="flex gap-2">
        {OPTIONS.map((n) => (
          <Button key={n} type="button" size="sm" variant={cfg[k] === n ? "default" : "outline"} onClick={() => setCfg({ ...cfg, [k]: n })}>
            {n}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 font-bold">
          <LayoutGrid className="h-5 w-5 text-primary" />
          تخطيط عرض صور الإعلانات
        </div>
        <p className="text-xs text-muted-foreground">عدد الإعلانات في كل صف (من 2 إلى 4).</p>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Row k="mobile" label="على الهاتف" />
            <Row k="desktop" label="على الكمبيوتر" />
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

export default AdminGridLayoutCard;
