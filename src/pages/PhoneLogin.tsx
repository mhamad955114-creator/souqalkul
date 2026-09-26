import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Phone, ShieldCheck, ArrowRight } from "lucide-react";

const E164 = /^\+[1-9]\d{7,14}$/;

const PhoneLogin = () => {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const [phone, setPhone] = useState("+963");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    timer.current = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [countdown]);

  useEffect(() => {
    if (!isNative) return;
    const subs: Array<Promise<{ remove: () => Promise<void> }>> = [
      FirebaseAuthentication.addListener("phoneCodeSent", (e) => {
        setVerificationId(e.verificationId);
        setLoading(false);
        toast.success("تم إرسال كود التحقق");
      }),
      FirebaseAuthentication.addListener("phoneVerificationFailed", (e) => {
        setLoading(false);
        setCountdown(0);
        toast.error("تعذّر إرسال الكود: " + e.message);
      }),
      FirebaseAuthentication.addListener("phoneVerificationCompleted", async () => {
        // Android auto-retrieved the SMS code
        await finishLogin();
      }),
    ];
    return () => { subs.forEach((s) => s.then((h) => h.remove())); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNative]);

  const sendCode = async () => {
    const cleaned = phone.replace(/[\s-]/g, "");
    if (!E164.test(cleaned)) {
      toast.error("أدخل الرقم بالصيغة الدولية مثل +963912345678");
      return;
    }
    if (!isNative) {
      toast.error("تسجيل الدخول برقم الهاتف متاح داخل تطبيق أندرويد فقط");
      return;
    }
    setLoading(true);
    setCountdown(60);
    try {
      await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber: cleaned });
    } catch (e) {
      setLoading(false);
      setCountdown(0);
      toast.error("تعذّر إرسال الكود");
      console.error(e);
    }
  };

  const finishLogin = async () => {
    const { token } = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
    const { data, error } = await supabase.functions.invoke("phone-auth", { body: { idToken: token } });
    if (error || !data?.token_hash) throw new Error("session_failed");
    const { error: vErr } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: "magiclink" });
    if (vErr) throw vErr;
    toast.success("تم تسجيل الدخول بنجاح");
    navigate("/", { replace: true });
  };

  const confirmCode = async () => {
    if (!/^\d{6}$/.test(code) || !verificationId) {
      toast.error("أدخل الكود المكوّن من 6 أرقام");
      return;
    }
    setLoading(true);
    try {
      await FirebaseAuthentication.confirmVerificationCode({ verificationId, verificationCode: code });
      await finishLogin();
    } catch (e) {
      console.error(e);
      toast.error("الكود غير صحيح أو انتهت صلاحيته");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-gradient-to-b from-primary/15 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-xl p-6 space-y-6">
        <button onClick={() => navigate(-1)} className="text-muted-foreground flex items-center gap-1 text-sm">
          <ArrowRight className="h-4 w-4" /> رجوع
        </button>
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <Phone className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">الدخول برقم الهاتف</h1>
          <p className="text-sm text-muted-foreground">سوق الكل — سجّل دخولك بكود يصلك برسالة SMS</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف (الصيغة الدولية)</Label>
          <Input id="phone" type="tel" dir="ltr" inputMode="tel" value={phone}
            onChange={(e) => setPhone(e.target.value)} placeholder="+963912345678" disabled={!!verificationId && loading} />
        </div>

        {/* Firebase verifies automatically via Play Integrity on Android; this container hosts reCAPTCHA fallback */}
        <div id="recaptcha-container" />

        <Button className="w-full" size="lg" onClick={sendCode} disabled={loading || countdown > 0}>
          {loading && !verificationId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {countdown > 0 ? `إعادة الإرسال بعد ${countdown} ث` : "إرسال كود التحقق"}
        </Button>

        {verificationId && (
          <div className="space-y-3 pt-2 border-t border-border">
            <Label htmlFor="otp">كود التحقق</Label>
            <Input id="otp" dir="ltr" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
              className="text-center text-2xl tracking-[0.5em] font-bold" value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" />
            <Button className="w-full" size="lg" onClick={confirmCode} disabled={loading || code.length !== 6}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              تأكيد الدخول
            </Button>
          </div>
        )}

        {!isNative && (
          <p className="text-xs text-center text-muted-foreground">هذه الميزة تعمل داخل تطبيق أندرويد.</p>
        )}
      </div>
    </div>
  );
};

export default PhoneLogin;
