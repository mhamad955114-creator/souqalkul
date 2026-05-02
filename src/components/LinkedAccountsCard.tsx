import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import { countries, getCountryByName, type CountryInfo } from "@/lib/constants";

import { toast } from "sonner";
import { Link2, Loader2, CheckCircle2, Unlink, Mail, Phone, Plus } from "lucide-react";

interface IdentityLite {
  id: string;
  provider: string;
  identity_id?: string;
  identity_data?: Record<string, any>;
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  apple: "Apple",
};

const LinkedAccountsCard = () => {
  const [identities, setIdentities] = useState<IdentityLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<IdentityLite | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStage, setOtpStage] = useState<"idle" | "sent">("idle");
  const [resendIn, setResendIn] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const [verifiedPhone, setVerifiedPhone] = useState<string>("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const { currentCountry } = useCountry();
  const [phoneCountry, setPhoneCountry] = useState<CountryInfo>(currentCountry);

  // Sync local dialog country when global country changes (e.g. auto-detection finishes)
  useEffect(() => {
    setPhoneCountry(currentCountry);
  }, [currentCountry]);

  const RESEND_COOLDOWN = 60; // seconds
  const OTP_VALIDITY = 600; // 10 minutes

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // Countdown for OTP validity
  useEffect(() => {
    if (expiresIn <= 0) return;
    const t = setInterval(() => setExpiresIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [expiresIn]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const validatePhone = (formatted: string): string | null => {
    // E.164: +<countrycode><digits>, total length 8-16
    if (!/^\+[1-9]\d{6,14}$/.test(formatted)) {
      return "رقم الهاتف غير صالح. تأكد من صيغة الرقم الدولية.";
    }
    return null;
  };

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUserIdentities();
    setIdentities((data?.identities ?? []) as IdentityLite[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const hasGoogle = identities.some((i) => i.provider === "google");
  const hasEmail = identities.some((i) => i.provider === "email");
  const hasPhone = identities.some((i) => i.provider === "phone");

  const formatPhone = (value: string): string => {
    let cleaned = value.replace(/[^0-9+]/g, "");
    const phoneCode = phoneCountry.phoneCode;
    if (cleaned.startsWith("0")) cleaned = phoneCode + cleaned.slice(1);
    else if (!cleaned.startsWith("+")) cleaned = phoneCode + cleaned;
    return cleaned;
  };

  const validateLocalPhone = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!phoneCountry.phonePattern.test(trimmed)) {
      return `صيغة الرقم غير صحيحة لـ${phoneCountry.name}. مثال: ${phoneCountry.phonePlaceholder}`;
    }
    return null;
  };

  const linkEmail = async () => {
    if (!emailValue.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }
    setBusy("email");
    const { error } = await supabase.auth.updateUser({ email: emailValue.trim() });
    setBusy(null);
    if (error) {
      toast.error("تعذّر إضافة البريد: " + error.message);
      return;
    }
    toast.success("تم إرسال رابط التأكيد إلى بريدك. افتح الرسالة لإكمال الربط.");
    setContactDialogOpen(false);
    setEmailValue("");
  };

  const sendPhoneOtp = async (isResend = false) => {
    if (!phoneValue.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }
    const localError = validateLocalPhone(phoneValue);
    if (localError) {
      toast.error(localError);
      return;
    }
    const formatted = formatPhone(phoneValue);
    const validationError = validatePhone(formatted);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (isResend && resendIn > 0) return;

    setBusy("phone");
    const { error } = await supabase.auth.updateUser({ phone: formatted });
    setBusy(null);
    if (error) {
      toast.error("تعذّر إرسال الرمز: " + error.message);
      return;
    }
    setVerifiedPhone(formatted);
    setOtpCode("");
    setResendIn(RESEND_COOLDOWN);
    setExpiresIn(OTP_VALIDITY);
    toast.success(isResend ? "تم إعادة إرسال الرمز" : "تم إرسال رمز التحقق عبر SMS");
    setOtpStage("sent");
  };

  const resetOtpFlow = (msg?: string) => {
    setOtpStage("idle");
    setOtpCode("");
    setResendIn(0);
    setExpiresIn(0);
    setVerifiedPhone("");
    setOtpError(null);
    if (msg) toast.info(msg);
  };

  const interpretOtpError = (raw: string): string => {
    const m = raw.toLowerCase();
    if (m.includes("expired")) return "انتهت صلاحية الرمز. يرجى طلب رمز جديد.";
    if (m.includes("invalid") || m.includes("incorrect") || m.includes("token"))
      return "الرمز الذي أدخلته غير صحيح. تحقق من الرسالة وحاول مرة أخرى.";
    if (m.includes("rate") || m.includes("too many"))
      return "تم تجاوز عدد المحاولات. انتظر قليلًا قبل المحاولة مجددًا.";
    if (m.includes("not found")) return "لم يتم العثور على طلب تحقق نشط. أعد إرسال الرمز.";
    return "تعذّر التحقق من الرمز: " + raw;
  };

  const verifyPhoneOtp = async () => {
    setOtpError(null);
    if (!/^\d{4,8}$/.test(otpCode.trim())) {
      setOtpError("يرجى إدخال رمز التحقق المكوّن من أرقام (4-8 أرقام).");
      return;
    }
    if (expiresIn <= 0) {
      setOtpError("انتهت صلاحية الرمز. يرجى طلب رمز جديد.");
      return;
    }
    // Verify the phone matches what OTP was sent to
    const currentFormatted = formatPhone(phoneValue);
    if (currentFormatted !== verifiedPhone) {
      setOtpError("تم تغيير الرقم. أعد إرسال الرمز للرقم الجديد.");
      return;
    }
    setBusy("phone");
    const { error } = await supabase.auth.verifyOtp({
      phone: verifiedPhone,
      token: otpCode.trim(),
      type: "phone_change",
    });
    setBusy(null);
    if (error) {
      const msg = interpretOtpError(error.message || "");
      setOtpError(msg);
      toast.error(msg);
      // If expired or not found, reset flow so the user can request a new code
      const lower = (error.message || "").toLowerCase();
      if (lower.includes("expired") || lower.includes("not found")) {
        resetOtpFlow();
      } else {
        // Clear the wrong code so user can retype
        setOtpCode("");
      }
      return;
    }
    toast.success("تم ربط رقم الهاتف بنجاح");
    setContactDialogOpen(false);
    setPhoneValue("");
    setOtpCode("");
    setOtpStage("idle");
    setResendIn(0);
    setExpiresIn(0);
    setVerifiedPhone("");
    setOtpError(null);
    await refresh();
  };

  const linkGoogle = async () => {
    setBusy("google");
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: { redirectTo: window.location.origin + "/settings" },
      });
      if (error) {
        toast.error("تعذّر ربط حساب Google: " + error.message);
        setBusy(null);
        return;
      }
      if ((data as any)?.url) return; // browser will redirect
      await refresh();
      toast.success("تم ربط حساب Google");
    } catch (e: any) {
      toast.error("حدث خطأ أثناء الربط");
    } finally {
      setBusy(null);
    }
  };

  const unlink = async (identity: IdentityLite) => {
    if (identities.length <= 1) {
      toast.error("لا يمكن إزالة الطريقة الوحيدة لتسجيل الدخول");
      return;
    }
    setBusy(identity.provider);
    const { error } = await supabase.auth.unlinkIdentity(identity as any);
    if (error) {
      toast.error("تعذّر فك الربط: " + error.message);
    } else {
      toast.success("تم فك الربط");
      await refresh();
    }
    setBusy(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          الحسابات المرتبطة
        </CardTitle>
        <CardDescription>
          اربط حساب Google بحسابك الحالي لتتمكن من تسجيل الدخول بطريقتين دون إنشاء حساب جديد.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {identities.map((idn) => (
                <div
                  key={idn.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {PROVIDER_LABELS[idn.provider] ?? idn.provider}
                    </span>
                    {idn.identity_data?.email && (
                      <span className="text-xs text-muted-foreground" dir="ltr">
                        {idn.identity_data.email}
                      </span>
                    )}
                  </div>
                  {identities.length > 1 && idn.provider !== "email" && idn.provider !== "phone" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === idn.provider}
                      onClick={() => setConfirmTarget(idn)}
                    >
                      {busy === idn.provider ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Unlink className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {!hasGoogle && (
              <Button
                variant="outline"
                className="w-full"
                disabled={busy === "google"}
                onClick={linkGoogle}
              >
                {busy === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"
                    />
                  </svg>
                )}
                ربط حساب Google
              </Button>
            )}

            {(!hasEmail || !hasPhone) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setOtpStage("idle");
                  setContactDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {!hasEmail && !hasPhone
                  ? "ربط بريد إلكتروني أو رقم هاتف"
                  : !hasEmail
                  ? "ربط بريد إلكتروني"
                  : "ربط رقم هاتف"}
              </Button>
            )}
          </>
        )}
      </CardContent>

      <AlertDialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد فك الربط</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد إزالة ربط حساب{" "}
              {confirmTarget ? PROVIDER_LABELS[confirmTarget.provider] ?? confirmTarget.provider : ""}؟
              لن تتمكن من تسجيل الدخول بهذه الطريقة بعد الآن.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const target = confirmTarget;
                setConfirmTarget(null);
                if (target) await unlink(target);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              نعم، فك الربط
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={contactDialogOpen} onOpenChange={(o) => { if (!o) { setContactDialogOpen(false); setOtpStage("idle"); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ربط طريقة دخول إضافية</DialogTitle>
            <DialogDescription>
              أضف بريدًا إلكترونيًا أو رقم هاتف إلى حسابك للدخول بهما لاحقًا.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue={!hasEmail ? "email" : "phone"} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="email" disabled={hasEmail}>
                <Mail className="h-4 w-4 me-1" /> بريد إلكتروني
              </TabsTrigger>
              <TabsTrigger value="phone" disabled={hasPhone}>
                <Phone className="h-4 w-4 me-1" /> رقم هاتف
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label htmlFor="linkEmail">البريد الإلكتروني</Label>
                <Input
                  id="linkEmail"
                  type="email"
                  dir="ltr"
                  placeholder="example@email.com"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                />
              </div>
              <Button onClick={linkEmail} className="w-full" disabled={busy === "email"}>
                {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                إرسال رابط التأكيد
              </Button>
              <p className="text-xs text-muted-foreground">
                ستصلك رسالة تحتوي رابط التأكيد. بعد الضغط عليه يصبح البريد مرتبطًا بحسابك.
              </p>
            </TabsContent>

            <TabsContent value="phone" className="space-y-3 mt-3">
              {otpStage === "idle" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="linkCountry">الدولة</Label>
                    <Select
                      value={phoneCountry.name}
                      onValueChange={(v) => setPhoneCountry(getCountryByName(v))}
                    >
                      <SelectTrigger id="linkCountry">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {countries.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            <span className="inline-flex items-center gap-2">
                              <span>{c.name}</span>
                              <span className="text-xs text-muted-foreground" dir="ltr">
                                {c.phoneCode}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkPhone">رقم الهاتف</Label>
                    <div className="flex items-center gap-2">
                      <span
                        dir="ltr"
                        className="px-3 py-2 rounded-md border border-input bg-muted text-sm text-muted-foreground"
                      >
                        {phoneCountry.phoneCode}
                      </span>
                      <Input
                        id="linkPhone"
                        type="tel"
                        dir="ltr"
                        placeholder={phoneCountry.phonePlaceholder}
                        value={phoneValue}
                        onChange={(e) => setPhoneValue(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      مثال: {phoneCountry.phonePlaceholder}
                    </p>
                  </div>
                  <Button onClick={() => sendPhoneOtp(false)} className="w-full" disabled={busy === "phone"}>
                    {busy === "phone" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                    إرسال رمز التحقق
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="otp">رمز التحقق</Label>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {verifiedPhone}
                    </p>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    dir="ltr"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ""));
                      if (otpError) setOtpError(null);
                    }}
                    aria-invalid={!!otpError}
                    className={otpError ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {otpError && (
                    <div
                      role="alert"
                      className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                    >
                      {otpError}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {expiresIn > 0
                        ? `صلاحية الرمز: ${formatTime(expiresIn)}`
                        : "انتهت صلاحية الرمز"}
                    </span>
                    <button
                      type="button"
                      disabled={resendIn > 0 || busy === "phone"}
                      onClick={() => { setOtpError(null); sendPhoneOtp(true); }}
                      className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {resendIn > 0 ? `إعادة الإرسال خلال ${resendIn} ث` : "إعادة إرسال الرمز"}
                    </button>
                  </div>
                  <Button
                    onClick={verifyPhoneOtp}
                    className="w-full"
                    disabled={busy === "phone" || expiresIn <= 0}
                  >
                    {busy === "phone" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    تأكيد وربط الرقم
                  </Button>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline w-full text-center"
                    onClick={() => { setOtpStage("idle"); setOtpCode(""); }}
                  >
                    تعديل الرقم
                  </button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LinkedAccountsCard;
