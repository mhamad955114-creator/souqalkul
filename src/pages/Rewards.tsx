import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, CalendarCheck, Users, Copy, Loader2, Star, Megaphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Lang = "ar" | "en" | "tr";
const copy = {
  ar: {
    title: "المكافآت", subtitle: "اجمع النقاط واستبدلها بترقية مجانية", balance: "رصيد نقاطك", pts: "نقطة",
    daily: "المكافأة اليومية", dailyBtn: "استلم +2 نقطة", dailyDone: "استلمت مكافأة اليوم",
    invite: "ادعُ أصدقاءك", inviteDesc: "تحصل على 20 نقطة وصديقك 10 نقاط عند تسجيله برابطك",
    yourCode: "رمزك", copyLink: "نسخ رابط الدعوة", copied: "تم نسخ الرابط",
    haveCode: "لديك رمز دعوة؟", apply: "تطبيق", earn: "طرق كسب النقاط",
    ways: ["نشر إعلان","بيع إعلان","تقييم بائع","تقييم 4 نجوم فأكثر لك","دخول يومي","دعوة صديق"],
    redeem: "استبدل نقاطك", days: "7 أيام", redeemBtn: "استبدال", history: "سجل النقاط", empty: "لا توجد حركات بعد",
    plans: { featured: "مميز", professional: "احترافي", business: "أعمال" },
    msgs: { ok: "تم بنجاح", insufficient: "نقاطك غير كافية", invalid: "رمز غير صالح", already: "استخدمت رمز دعوة من قبل", too_late: "رمز الدعوة متاح فقط للحسابات الجديدة", self: "لا يمكنك استخدام رمزك" },
    reasons: { listing: "نشر إعلان", sold: "بيع إعلان", rating_given: "تقييم بائع", rating_received: "تقييم إيجابي", daily: "مكافأة يومية", referral: "دعوة صديق", referred: "التسجيل بدعوة", redeem: "استبدال باقة" },
    login: "سجّل الدخول لعرض المكافآت",
  },
  en: {
    title: "Rewards", subtitle: "Collect points and redeem them for a free upgrade", balance: "Your points", pts: "pts",
    daily: "Daily reward", dailyBtn: "Claim +2 points", dailyDone: "Today's reward claimed",
    invite: "Invite friends", inviteDesc: "You get 20 points and your friend gets 10 when they sign up with your link",
    yourCode: "Your code", copyLink: "Copy invite link", copied: "Link copied",
    haveCode: "Have an invite code?", apply: "Apply", earn: "Ways to earn",
    ways: ["Post a listing","Sell a listing","Rate a seller","Receive 4+ stars","Daily login","Invite a friend"],
    redeem: "Redeem points", days: "7 days", redeemBtn: "Redeem", history: "Points history", empty: "No activity yet",
    plans: { featured: "Featured", professional: "Professional", business: "Business" },
    msgs: { ok: "Done", insufficient: "Not enough points", invalid: "Invalid code", already: "You already used an invite code", too_late: "Invite codes are for new accounts only", self: "You can't use your own code" },
    reasons: { listing: "Listing posted", sold: "Listing sold", rating_given: "Rated a seller", rating_received: "Positive rating", daily: "Daily reward", referral: "Friend invited", referred: "Joined by invite", redeem: "Plan redeemed" },
    login: "Sign in to view rewards",
  },
  tr: {
    title: "Ödüller", subtitle: "Puan topla ve ücretsiz yükseltmeyle değiştir", balance: "Puanların", pts: "puan",
    daily: "Günlük ödül", dailyBtn: "+2 puan al", dailyDone: "Bugünün ödülü alındı",
    invite: "Arkadaşlarını davet et", inviteDesc: "Arkadaşın bağlantınla kaydolduğunda sen 20, o 10 puan kazanır",
    yourCode: "Kodun", copyLink: "Davet bağlantısını kopyala", copied: "Bağlantı kopyalandı",
    haveCode: "Davet kodun var mı?", apply: "Uygula", earn: "Puan kazanma yolları",
    ways: ["İlan yayınla","İlan sat","Satıcı değerlendir","4+ yıldız al","Günlük giriş","Arkadaş davet et"],
    redeem: "Puanlarını kullan", days: "7 gün", redeemBtn: "Kullan", history: "Puan geçmişi", empty: "Henüz hareket yok",
    plans: { featured: "Öne Çıkan", professional: "Profesyonel", business: "İşletme" },
    msgs: { ok: "Tamamlandı", insufficient: "Yetersiz puan", invalid: "Geçersiz kod", already: "Zaten bir davet kodu kullandın", too_late: "Davet kodları yalnızca yeni hesaplar içindir", self: "Kendi kodunu kullanamazsın" },
    reasons: { listing: "İlan yayınlandı", sold: "İlan satıldı", rating_given: "Satıcı değerlendirildi", rating_received: "Olumlu değerlendirme", daily: "Günlük ödül", referral: "Arkadaş davet edildi", referred: "Davetle katıldı", redeem: "Paket kullanıldı" },
    login: "Ödülleri görmek için giriş yap",
  },
};

const PLANS = [
  { key: "featured", cost: 100 },
  { key: "professional", cost: 250 },
  { key: "business", cost: 500 },
] as const;

interface Tx { id: string; points: number; reason: string; created_at: string }

const Rewards = () => {
  const { user, loading: authLoading } = useAuth();
  const { language, dir } = useLanguage();
  const c = copy[(language as Lang) in copy ? (language as Lang) : "ar"];
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [cfg, setCfg] = useState<Record<string, number | boolean>>({});
  useEffect(() => { supabase.rpc("get_rewards_config").then(({ data }) => setCfg((data as Record<string, number | boolean>) ?? {})); }, []);
  const n = (k: string, d: number) => Number(cfg[k] ?? d);
  const wayVals = [n("listing",5), n("sold",10), n("rating_given",2), n("rating_received",5), n("daily",2), n("referral",20)];

  const today = new Date().toISOString().slice(0, 10);
  const claimedToday = txs.some((t) => t.reason === "daily" && t.created_at.slice(0, 10) === today);
  const myCode = user?.id.slice(0, 8) ?? "";
  const nf = new Intl.NumberFormat("en-US");

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: bal }, { data: list }] = await Promise.all([
      supabase.rpc("get_reward_balance", { _user_id: user.id }),
      supabase.from("reward_transactions").select("id, points, reason, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);
    setBalance(bal ?? 0);
    setTxs(list ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) setLoading(false);
    load();
  }, [authLoading, user, load]);

  const msg = (k: string) => (c.msgs as Record<string, string>)[k] ?? k;

  const claim = async () => {
    setBusy("daily");
    const { error } = await supabase.rpc("claim_daily_reward");
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(c.msgs.ok);
    load();
  };

  const applyCode = async () => {
    setBusy("code");
    const { data, error } = await supabase.rpc("apply_referral", { _code: code.trim() });
    setBusy(null);
    if (error) return toast.error(error.message);
    data === "ok" ? toast.success(msg("ok")) : toast.error(msg(data as string));
    if (data === "ok") { setCode(""); load(); }
  };

  const redeem = async (plan: string) => {
    setBusy(plan);
    const { data, error } = await supabase.rpc("redeem_reward", { _plan_type: plan });
    setBusy(null);
    if (error) return toast.error(error.message);
    data === "ok" ? toast.success(msg("ok")) : toast.error(msg(data as string));
    if (data === "ok") load();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?ref=${myCode}`);
      toast.success(c.copied);
    } catch { /* ignore */ }
  };

  const reasonLabel = (r: string) => (r.startsWith("redeem_") ? c.reasons.redeem : (c.reasons as Record<string, string>)[r] ?? r);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-24" dir={dir}>
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Gift className="h-6 w-6 text-primary" />{c.title}</h1>
          <p className="text-muted-foreground mt-1">{c.subtitle}</p>
        </div>

        {!user && !authLoading ? (
          <Card><CardContent className="p-6 text-center space-y-3">
            <p>{c.login}</p>
            <Button onClick={() => navigate("/auth")}>{c.login}</Button>
          </CardContent></Card>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="p-6 text-center">
                <p className="opacity-90">{c.balance}</p>
                <p className="text-5xl font-bold mt-2">{nf.format(balance)}</p>
                <p className="opacity-90">{c.pts}</p>
              </CardContent>
            </Card>

            <Card><CardContent className="p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><CalendarCheck className="h-6 w-6 text-primary" /><span className="font-bold">{c.daily}</span></div>
              <Button onClick={claim} disabled={claimedToday || busy === "daily"}>
                {busy === "daily" ? <Loader2 className="h-4 w-4 animate-spin" /> : claimedToday ? <><CheckCircle2 className="h-4 w-4" />{c.dailyDone}</> : c.dailyBtn}
              </Button>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3"><Users className="h-6 w-6 text-primary" /><span className="font-bold">{c.invite}</span></div>
              <p className="text-sm text-muted-foreground">{c.inviteDesc}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm">{c.yourCode}:</span>
                <code className="px-3 py-1 rounded-md bg-muted font-bold tracking-widest" dir="ltr">{myCode}</code>
                <Button variant="outline" size="sm" onClick={copyLink}><Copy className="h-4 w-4" />{c.copyLink}</Button>
              </div>
              <div className="flex gap-2 pt-2">
                <Input placeholder={c.haveCode} value={code} onChange={(e) => setCode(e.target.value)} maxLength={8} dir="ltr" />
                <Button onClick={applyCode} disabled={code.trim().length !== 8 || busy === "code"}>{c.apply}</Button>
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3"><Gift className="h-6 w-6 text-primary" /><span className="font-bold">{c.redeem}</span></div>
              <div className="grid gap-3 sm:grid-cols-3">
                {PLANS.map((p) => (
                  <div key={p.key} className="rounded-xl border border-border p-4 text-center space-y-2">
                    <p className="font-bold">{c.plans[p.key]}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">{n("redeem_days", 7)} {c.days.split(" ")[1]}</p>
                    <p className="text-primary font-bold">{nf.format(n("cost_" + p.key, p.cost))} {c.pts}</p>
                    <Button size="sm" className="w-full" disabled={cfg.enabled === false || balance < n("cost_" + p.key, p.cost) || busy === p.key} onClick={() => redeem(p.key)}>
                      {busy === p.key ? <Loader2 className="h-4 w-4 animate-spin" /> : c.redeemBtn}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-3"><Star className="h-6 w-6 text-primary" /><span className="font-bold">{c.earn}</span></div>
              <ul className="space-y-1 text-sm">
                {c.ways.map((w, i) => wayVals[i] > 0 && <li key={w} className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-muted-foreground" />{w}: <span dir="ltr">+{wayVals[i]}</span></li>)}
              </ul>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-2">
              <p className="font-bold">{c.history}</p>
              {txs.length === 0 ? <p className="text-sm text-muted-foreground">{c.empty}</p> : txs.map((t) => (
                <div key={t.id} className="flex justify-between text-sm border-b border-border last:border-0 py-2">
                  <span>{reasonLabel(t.reason)} <span className="text-muted-foreground text-xs" dir="ltr">{new Date(t.created_at).toLocaleDateString("en-GB")}</span></span>
                  <span className={t.points >= 0 ? "text-primary font-bold" : "text-destructive font-bold"} dir="ltr">{t.points > 0 ? "+" : ""}{nf.format(t.points)}</span>
                </div>
              ))}
            </CardContent></Card>
          </>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Rewards;
