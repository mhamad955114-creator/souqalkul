import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Search, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Config = Record<string, number | boolean>;

const FIELDS: { key: string; label: string }[] = [
  { key: "listing", label: "نقاط نشر إعلان" },
  { key: "listing_daily_cap", label: "حد إعلانات النقاط يوميًا" },
  { key: "sold", label: "نقاط بيع إعلان" },
  { key: "rating_given", label: "نقاط تقييم بائع" },
  { key: "rating_received", label: "نقاط تقييم 4+ نجوم للبائع" },
  { key: "daily", label: "المكافأة اليومية" },
  { key: "referral", label: "نقاط الداعي" },
  { key: "referred", label: "نقاط المدعو" },
  { key: "referral_window_days", label: "مدة قبول رمز الدعوة (أيام)" },
  { key: "redeem_days", label: "مدة الترقية المستبدلة (أيام)" },
  { key: "cost_featured", label: "تكلفة باقة مميز" },
  { key: "cost_professional", label: "تكلفة باقة احترافي" },
  { key: "cost_business", label: "تكلفة باقة أعمال" },
];

interface Row { user_id: string; full_name: string | null; balance: number; earned: number; tx_count: number; last_at: string | null }
interface Tx { id: string; user_id: string; points: number; reason: string; created_at: string }

const nf = new Intl.NumberFormat("en-US");

const AdminRewardsTab = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [adjust, setAdjust] = useState<Record<string, { pts: string; note: string }>>({});

  const loadUsers = useCallback(async (q = "") => {
    const { data, error } = await supabase.rpc("admin_rewards_users", { _search: q || null });
    if (error) toast.error(error.message);
    setRows((data as Row[]) ?? []);
  }, []);

  const loadTxs = useCallback(async () => {
    const { data } = await supabase.from("reward_transactions").select("id, user_id, points, reason, created_at").order("created_at", { ascending: false }).limit(30);
    setTxs(data ?? []);
  }, []);

  useEffect(() => {
    supabase.rpc("get_rewards_config").then(({ data }) => setConfig((data as Config) ?? {}));
    loadUsers();
    loadTxs();
  }, [loadUsers, loadTxs]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    const clean: Config = { enabled: !!config.enabled };
    FIELDS.forEach((f) => { clean[f.key] = Math.max(0, Math.floor(Number(config[f.key]) || 0)); });
    const { error } = await supabase.rpc("admin_set_rewards_config", { _config: clean });
    setSaving(false);
    error ? toast.error(error.message) : toast.success("تم حفظ إعدادات المكافآت");
  };

  const doAdjust = async (userId: string, sign: 1 | -1) => {
    const a = adjust[userId];
    const pts = Math.floor(Number(a?.pts) || 0);
    if (pts <= 0) return toast.error("أدخل عددًا صحيحًا");
    const { error } = await supabase.rpc("admin_adjust_points", { _user_id: userId, _points: pts * sign, _note: a?.note || null });
    if (error) return toast.error(error.message);
    toast.success(sign > 0 ? "تمت إضافة النقاط" : "تم خصم النقاط");
    setAdjust((s) => ({ ...s, [userId]: { pts: "", note: "" } }));
    loadUsers(search);
    loadTxs();
  };

  const name = (id: string) => rows.find((r) => r.user_id === id)?.full_name || id.slice(0, 8);

  if (!config) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5" dir="rtl">
      <Card><CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">إعدادات المكافآت</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">{config.enabled ? "مفعّل" : "متوقف"}</span>
            <Switch checked={!!config.enabled} onCheckedChange={(v) => setConfig({ ...config, enabled: v })} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className="space-y-1">
              <span className="text-sm text-muted-foreground">{f.label}</span>
              <Input type="number" min={0} dir="ltr" value={String(config[f.key] ?? 0)}
                onChange={(e) => setConfig({ ...config, [f.key]: Number(e.target.value) })} />
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">ضع 0 لإيقاف أي طريقة كسب بعينها.</p>
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}حفظ</Button>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-lg">نقاط المستخدمين</h3>
        <div className="flex gap-2">
          <Input placeholder="ابحث بالاسم أو رمز الدعوة" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadUsers(search)} />
          <Button variant="outline" onClick={() => loadUsers(search)}><Search className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.user_id} className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex justify-between gap-2 flex-wrap">
                <div>
                  <p className="font-bold">{r.full_name || "مستخدم"}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{r.user_id.slice(0, 8)} · {r.tx_count} حركة</p>
                </div>
                <div className="text-left">
                  <p className="text-primary font-bold">{nf.format(r.balance)} نقطة</p>
                  <p className="text-xs text-muted-foreground">مجموع المكتسب {nf.format(r.earned)}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Input className="w-24" type="number" min={1} dir="ltr" placeholder="عدد" value={adjust[r.user_id]?.pts ?? ""}
                  onChange={(e) => setAdjust((s) => ({ ...s, [r.user_id]: { note: s[r.user_id]?.note ?? "", pts: e.target.value } }))} />
                <Input className="flex-1 min-w-[120px]" placeholder="ملاحظة (اختياري)" value={adjust[r.user_id]?.note ?? ""}
                  onChange={(e) => setAdjust((s) => ({ ...s, [r.user_id]: { pts: s[r.user_id]?.pts ?? "", note: e.target.value } }))} />
                <Button size="sm" onClick={() => doAdjust(r.user_id, 1)}><Plus className="h-4 w-4" />إضافة</Button>
                <Button size="sm" variant="destructive" onClick={() => doAdjust(r.user_id, -1)}><Minus className="h-4 w-4" />خصم</Button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد نتائج</p>}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-2">
        <h3 className="font-bold text-lg">آخر الحركات</h3>
        {txs.map((t) => (
          <div key={t.id} className="flex justify-between text-sm border-b border-border last:border-0 py-2">
            <span>{name(t.user_id)} · {t.reason} <span className="text-xs text-muted-foreground" dir="ltr">{new Date(t.created_at).toLocaleString("en-GB")}</span></span>
            <span className={t.points >= 0 ? "text-primary font-bold" : "text-destructive font-bold"} dir="ltr">{t.points > 0 ? "+" : ""}{nf.format(t.points)}</span>
          </div>
        ))}
        {txs.length === 0 && <p className="text-sm text-muted-foreground">لا توجد حركات</p>}
      </CardContent></Card>
    </div>
  );
};

export default AdminRewardsTab;
