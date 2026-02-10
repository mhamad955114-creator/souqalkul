import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

const AuthModal = ({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(defaultTab === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t, dir } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(t.auth.loginError + error.message);
        } else {
          toast.success(t.auth.loginSuccess);
          onClose();
          resetForm();
        }
      } else {
        if (!fullName.trim()) {
          toast.error(t.auth.fullNameRequired);
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(t.auth.signupError + error.message);
        } else {
          toast.success(t.auth.signupSuccess);
          onClose();
          resetForm();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const iconSide = dir === "rtl" ? "right-3" : "left-3";
  const inputPadding = dir === "rtl" ? "pr-10" : "pl-10";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? t.auth.login : t.auth.createAccount}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!isLogin && (
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
                  required={!isLogin}
                />
              </div>
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <div className="relative">
              <Lock className={`absolute ${iconSide} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
              <Input
                id="password"
                type="password"
                placeholder={t.auth.enterPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputPadding}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.auth.processing}
              </>
            ) : isLogin ? (
              t.auth.login
            ) : (
              t.auth.signup
            )}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline text-sm"
          >
            {isLogin ? t.auth.noAccount : t.auth.hasAccount}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
