import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error("فشل تسجيل الدخول: " + error.message);
        } else {
          toast.success("تم تسجيل الدخول بنجاح!");
          onClose();
          resetForm();
        }
      } else {
        if (!fullName.trim()) {
          toast.error("يرجى إدخال الاسم الكامل");
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error("فشل إنشاء الحساب: " + error.message);
        } else {
          toast.success("تم إنشاء الحساب بنجاح!");
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pr-10"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : isLogin ? (
              "تسجيل الدخول"
            ) : (
              "إنشاء حساب"
            )}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline text-sm"
          >
            {isLogin ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب بالفعل؟ تسجيل الدخول"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
