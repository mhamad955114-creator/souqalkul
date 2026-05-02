import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { translateAuthError } from "@/lib/authErrors";
import { Loader2, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle2, Inbox } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountry } from "@/contexts/CountryContext";
import { lovable } from "@/integrations/lovable";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

type AuthMode = "login" | "signup" | "forgot";
type AuthMethod = "email" | "phone";

const AuthModal = ({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>(defaultTab);
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const { signIn, signUp, signInWithPhone, signUpWithPhone, resetPassword } = useAuth();
  const { t, dir } = useLanguage();
  const { currentCountry } = useCountry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        if (!email.trim()) {
          toast.error("يرجى إدخال البريد الإلكتروني");
          return;
        }
        const { error } = await resetPassword(email);
        if (error) {
          toast.error("خطأ في إرسال رابط الاسترداد: " + error.message);
        } else {
          toast.success("تم إرسال رابط استرداد كلمة المرور إلى بريدك الإلكتروني");
          setMode("login");
        }
        return;
      }

      if (mode === "login") {
        if (method === "email") {
          const { error } = await signIn(email, password);
          if (error) {
            toast.error(t.auth.loginError + error.message);
          } else {
            toast.success(t.auth.loginSuccess);
            onClose();
            resetForm();
          }
        } else {
          const formattedPhone = formatPhone(phone);
          const { error } = await signInWithPhone(formattedPhone, password);
          if (error) {
            toast.error(t.auth.loginError + translateAuthError(error.message));
          } else {
            toast.success(t.auth.loginSuccess);
            onClose();
            resetForm();
          }
        }
      } else {
        if (!fullName.trim()) {
          toast.error(t.auth.fullNameRequired);
          return;
        }
        if (method === "email") {
          const { error } = await signUp(email, password, fullName);
          if (error) {
            toast.error(translateAuthError(error.message));
          } else {
            setConfirmationEmail(email);
            setShowEmailConfirmation(true);
          }
        } else {
          const formattedPhone = formatPhone(phone);
          const { error } = await signUpWithPhone(formattedPhone, password, fullName);
          if (error) {
            toast.error(translateAuthError(error.message));
          } else {
            toast.success("تم إنشاء الحساب بنجاح!");
            onClose();
            resetForm();
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string): string => {
    let cleaned = value.replace(/[^0-9+]/g, "");
    const phoneCode = currentCountry.phoneCode;
    if (cleaned.startsWith("0")) cleaned = phoneCode + cleaned.slice(1);
    else if (!cleaned.startsWith("+")) cleaned = phoneCode + cleaned;
    return cleaned;
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setShowPassword(false);
  };

  const iconSide = dir === "rtl" ? "right-3" : "left-3";
  const inputPadding = dir === "rtl" ? "pr-10" : "pl-10";
  const eyeSide = dir === "rtl" ? "left-3" : "right-3";

  const getTitle = () => {
    if (mode === "forgot") return "استرداد كلمة المرور";
    if (mode === "login") return t.auth.login;
    return t.auth.createAccount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        {/* Email Confirmation Notice */}
        {showEmailConfirmation ? (
          <div className="text-center space-y-5 py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Inbox className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">تحقق من بريدك الإلكتروني</h3>
              <p className="text-sm text-muted-foreground">تم إرسال رابط التأكيد إلى</p>
              <p className="font-semibold text-primary" dir="ltr">{confirmationEmail}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-start">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">افتح بريدك الإلكتروني واضغط على رابط التأكيد لتفعيل حسابك</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">إذا لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setShowEmailConfirmation(false);
                setMode("login");
                resetForm();
              }}
              className="w-full"
              size="lg"
            >
              <Mail className="h-5 w-5" />
              العودة لتسجيل الدخول
            </Button>
          </div>
        ) : (
        <>
        {/* Forgot Password Mode */}
        {mode === "forgot" ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground text-center">
              أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
            </p>
            <div className="space-y-2">
              <Label htmlFor="resetEmail">{t.auth.email}</Label>
              <div className="relative">
                <Mail className={`absolute ${iconSide} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputPadding}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال رابط الاسترداد"
              )}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary hover:underline text-sm flex items-center gap-1 mx-auto"
              >
                <ArrowRight className="h-3 w-3" />
                العودة لتسجيل الدخول
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Method Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden mt-2">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  method === "email"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </button>
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  method === "phone"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Phone className="h-4 w-4" />
                رقم الهاتف
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.auth.fullName}</Label>
                  <div className="relative">
                    <User className={`absolute ${iconSide} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t.auth.enterFullName}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputPadding}
                      required
                    />
                  </div>
                </div>
              )}

              {method === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="email">{t.auth.email}</Label>
                  <div className="relative">
                    <Mail className={`absolute ${iconSide} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputPadding}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className={`absolute ${iconSide} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={currentCountry.phonePlaceholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputPadding}
                      dir="ltr"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    أدخل رقم هاتفك ({currentCountry.name}) (مثال: {currentCountry.phonePlaceholder})
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <div className="relative">
                  <Lock className={`absolute ${iconSide} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.auth.enterPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputPadding} ${dir === "rtl" ? "pl-10" : "pr-10"}`}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${eyeSide} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {mode === "login" && method === "email" && (
                <div className="text-end">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-primary hover:underline text-xs"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.auth.processing}
                  </>
                ) : mode === "login" ? (
                  t.auth.login
                ) : (
                  t.auth.signup
                )}
              </Button>
            </form>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary hover:underline text-sm"
              >
                {mode === "login" ? t.auth.noAccount : t.auth.hasAccount}
              </button>
            </div>
          </>
        )}
        </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
