import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { translateAuthError } from "@/lib/authErrors";
import { Loader2, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBrand } from "@/contexts/BrandContext";

type AuthMode = "login" | "signup" | "forgot";
type AuthMethod = "email" | "phone";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithPhone, signUpWithPhone, resetPassword, user } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

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
          if (error) toast.error(t.auth.loginError + translateAuthError(error.message));
          else { toast.success(t.auth.loginSuccess); navigate("/"); }
        } else {
          const formattedPhone = formatPhone(phone);
          const { error } = await signInWithPhone(formattedPhone, password);
          if (error) toast.error(t.auth.loginError + translateAuthError(error.message));
          else { toast.success(t.auth.loginSuccess); navigate("/"); }
        }
      } else {
        if (!fullName.trim()) {
          toast.error(t.auth.fullNameRequired);
          return;
        }
        if (method === "email") {
          const { error } = await signUp(email, password, fullName);
          if (error) toast.error(translateAuthError(error.message));
          else { toast.success(t.auth.signupSuccess); }
        } else {
          const formattedPhone = formatPhone(phone);
          const { error } = await signUpWithPhone(formattedPhone, password, fullName);
          if (error) toast.error(translateAuthError(error.message));
          else { toast.success("تم إنشاء الحساب بنجاح!"); }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string): string => {
    let cleaned = value.replace(/[^0-9+]/g, "");
    if (cleaned.startsWith("09")) cleaned = "+963" + cleaned.slice(1);
    else if (cleaned.startsWith("9") && !cleaned.startsWith("+")) cleaned = "+963" + cleaned;
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned;
  };

  const iconSide = dir === "rtl" ? "right-3" : "left-3";
  const inputPadding = dir === "rtl" ? "pr-10" : "pl-10";
  const eyeSide = dir === "rtl" ? "left-3" : "right-3";

  return (
    <div className="min-h-screen flex" dir={dir}>
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute bottom-32 left-16 w-56 h-56 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-primary/5 blur-2xl animate-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="mb-8 flex justify-center">
            <div className="w-28 h-28 rounded-3xl bg-card/10 backdrop-blur-sm border border-primary-foreground/10 flex items-center justify-center shadow-2xl">
              <img src={logo} alt="سوق الكل" className="w-20 h-20 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4 font-cairo">
            سوق الكل
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            منصتك الموثوقة للبيع والشراء. اكتشف آلاف الإعلانات أو أنشئ إعلانك الخاص بسهولة.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 text-primary-foreground/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm">سهل وسريع</span>
            </div>
            <div className="w-px h-5 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" />
              <span className="text-sm">آلاف الإعلانات</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="سوق الكل" className="w-16 h-16 object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              {mode === "forgot" ? "استرداد كلمة المرور" : mode === "login" ? t.auth.login : t.auth.createAccount}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === "forgot"
                ? "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور"
                : mode === "login"
                ? "أهلاً بعودتك! سجّل دخولك للمتابعة"
                : "أنشئ حسابك الآن وابدأ رحلتك معنا"}
            </p>
          </div>

          {mode === "forgot" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className={`${inputPadding} h-12`}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base shadow-button" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...</> : "إرسال رابط الاسترداد"}
              </Button>
              <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline text-sm flex items-center gap-1 mx-auto">
                <ArrowRight className="h-3 w-3" /> العودة لتسجيل الدخول
              </button>
            </form>
          ) : (
            <>
              {/* Method Toggle */}
              <div className="flex rounded-xl border border-border overflow-hidden mb-6 bg-muted/30">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 rounded-xl ${
                    method === "email"
                      ? "bg-primary text-primary-foreground shadow-button"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 rounded-xl ${
                    method === "phone"
                      ? "bg-primary text-primary-foreground shadow-button"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  رقم الهاتف
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                        className={`${inputPadding} h-12`}
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
                        className={`${inputPadding} h-12`}
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
                        placeholder="09XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`${inputPadding} h-12`}
                        dir="ltr"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">أدخل رقم هاتفك السوري (مثال: 0912345678)</p>
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
                      className={`${inputPadding} ${dir === "rtl" ? "pl-10" : "pr-10"} h-12`}
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
                    <button type="button" onClick={() => setMode("forgot")} className="text-primary hover:underline text-sm">
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base shadow-button" size="lg" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.processing}</>
                  ) : mode === "login" ? t.auth.login : t.auth.signup}
                </Button>
              </form>

              <div className="text-center mt-6">
                <span className="text-muted-foreground text-sm">
                  {mode === "login" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
                </span>
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-primary hover:underline text-sm font-semibold"
                >
                  {mode === "login" ? t.auth.signup : t.auth.login}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
