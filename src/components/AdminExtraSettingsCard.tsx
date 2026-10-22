import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Loader2, Mail, Bell, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SHARE_URL, SHARE_URL_KEY } from "@/hooks/useShareBaseUrl";

const TOGGLES_KEY = "listing_notification_toggles";
const EMAIL_KEY = "email_preferences";
type Toggles = { new_listing: boolean; approval: boolean; expiry: boolean };
const DEFAULT_TOGGLES: Toggles = { new_listing: true, approval: true, expiry: true };

const upsert = async (table: "listing_settings" | "admin_settings", key: string, value: any) => {
  const db = supabase as any;
  const { data, error } = await db.from(table)
    .update({ setting_value: value, updated_at: new Date().toISOString() })
    .eq("setting_key", key).select("id");
  if (error) return error;
  if (!data?.length) return (await db.from(table).insert({ setting_key: key, setting_value: value })).error;
  return null;
};

const isEmail = (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const AdminExtraSettingsCard = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState(DEFAULT_SHARE_URL);
  const [supportEmail, setSupportEmail] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [emailsEnabled, setEmailsEnabled] = useState(true);
  const [toggles, setToggles] = useState<Toggles>(DEFAULT_TOGGLES);

  useEffect(() => {
    (async () => {
      const [{ data: pub }, { data: adm }] = await Promise.all([
        supabase.from("listing_settings").select("setting_key, setting_value")
          .in("setting_key", [SHARE_URL_KEY, "contact_email", TOGGLES_KEY]),
        (supabase as any).from("admin_settings").select("setting_key, setting_value").eq("setting_key", EMAIL_KEY),
      ]);
      (pub || []).forEach((r: any) => {
        const v = r.setting_value;
        if (r.setting_key === SHARE_URL_KEY) setShareUrl(typeof v === "string" ? v : v?.url || DEFAULT_SHARE_URL);
        if (r.setting_key === "contact_email") setSupportEmail(typeof v === "string" ? v : "");
        if (r.setting_key === TOGGLES_KEY) setToggles({ ...DEFAULT_TOGGLES, ...(v || {}) });
      });
      const e = adm?.[0]?.setting_value;
      if (e) { setAlertEmail(e.admin_alert_email || ""); setEmailsEnabled(e.enabled !== false); }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    const url = shareUrl.trim().replace(/\/+$/, "");
    if (!/^https?:\/\/[^\s]+$/i.test(url)) return toast.error("رابط الموقع غير صحيح، يجب أن يبدأ بـ https://");
    if (!isEmail(supportEmail.trim()) || !isEmail(alertEmail.trim())) return toast.error("البريد الإلكتروني غير صحيح");
    setSaving(true);
    const errs = await Promise.all([
      upsert("listing_settings", SHARE_URL_KEY, { url }),
      upsert("listing_settings", "contact_email", supportEmail.trim()),
      upsert("listing_settings", TOGGLES_KEY, toggles),
      upsert("admin_settings", EMAIL_KEY, { enabled: emailsEnabled, admin_alert_email: alertEmail.trim() }),
    ]);
    setSaving(false);
    if (errs.some(Boolean)) toast.error("فشل حفظ بعض الإعدادات");
    else toast.success("تم حفظ الإعدادات الإضافية");
  };

  if (loading) return null;

  const row = (label: string, desc: string, k: keyof Toggles) => (
    <div className="flex items-center justify-between gap-4">
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <Switch checked={toggles[k]} onCheckedChange={(v) => setToggles({ ...toggles, [k]: v })} />
    </div>
  );

  return (
    <Card className="border-primary/30">
      <CardContent className="p-6 space-y-6">
        <h3 className="font-bold text-lg">إعدادات إضافية</h3>

        <section className="space-y-2">
          <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /><Label>رابط الموقع للمشاركة</Label></div>
          <Input dir="ltr" value={shareUrl} onChange={(e) => setShareUrl(e.target.value)} placeholder="https://souqalkul.com" />
          <p className="text-xs text-muted-foreground">يُستخدم عند مشاركة الإعلانات والتطبيق</p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><Label>إعدادات البريد</Label></div>
          <div className="space-y-1">
            <Label className="text-xs">بريد الدعم (يظهر في صفحة اتصل بنا)</Label>
            <Input dir="ltr" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">بريد تنبيهات الإدارة</Label>
            <Input dir="ltr" type="email" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">تشغيل رسائل البريد من التطبيق</p>
            <Switch checked={emailsEnabled} onCheckedChange={setEmailsEnabled} />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /><Label>إشعارات الإعلانات</Label></div>
          {row("عند نشر إعلان جديد", "إشعار لمتابعي القسم", "new_listing")}
          {row("عند الموافقة أو الرفض", "إشعار لصاحب الإعلان", "approval")}
          {row("عند انتهاء الإعلان", "إشعار لصاحب الإعلان", "expiry")}
        </section>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminExtraSettingsCard;
