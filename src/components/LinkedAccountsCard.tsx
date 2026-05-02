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
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";

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
  const { currentCountry } = useCountry();

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
    const phoneCode = currentCountry.phoneCode;
    if (cleaned.startsWith("0")) cleaned = phoneCode + cleaned.slice(1);
    else if (!cleaned.startsWith("+")) cleaned = phoneCode + cleaned;
    return cleaned;
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

  const sendPhoneOtp = async () => {
    if (!phoneValue.trim()) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }
    setBusy("phone");
    const formatted = formatPhone(phoneValue);
    const { error } = await supabase.auth.updateUser({ phone: formatted });
    setBusy(null);
    if (error) {
      toast.error("تعذّر إرسال الرمز: " + error.message);
      return;
    }
    toast.success("تم إرسال رمز التحقق عبر SMS");
    setOtpStage("sent");
  };

  const verifyPhoneOtp = async () => {
    if (!otpCode.trim()) {
      toast.error("يرجى إدخال رمز التحقق");
      return;
    }
    setBusy("phone");
    const formatted = formatPhone(phoneValue);
    const { error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otpCode.trim(),
      type: "phone_change",
    });
    setBusy(null);
    if (error) {
      toast.error("رمز غير صحيح: " + error.message);
      return;
    }
    toast.success("تم ربط رقم الهاتف بنجاح");
    setContactDialogOpen(false);
    setPhoneValue("");
    setOtpCode("");
    setOtpStage("idle");
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
    </Card>
  );
};

export default LinkedAccountsCard;
