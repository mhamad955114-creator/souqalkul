import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";
import { Link2, Loader2, CheckCircle2, Unlink } from "lucide-react";

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
                      onClick={() => unlink(idn)}
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkedAccountsCard;
