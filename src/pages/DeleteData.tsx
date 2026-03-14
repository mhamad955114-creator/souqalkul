import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Trash2, Loader2, Shield, AlertTriangle, CheckCircle, LogIn } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const DeleteData = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "حذف حسابي") {
      toast.error("يرجى كتابة 'حذف حسابي' للتأكيد");
      return;
    }

    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No session");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) throw new Error("Delete failed");

      await supabase.auth.signOut({ scope: "global" });
      setDeleted(true);
      toast.success("تم حذف حسابك وجميع بياناتك بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("فشل حذف الحساب، يرجى المحاولة مرة أخرى");
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">تم حذف الحساب بنجاح</h1>
            <p className="text-muted-foreground mb-6">
              تم حذف حسابك وجميع بياناتك المرتبطة به بشكل نهائي. شكراً لاستخدامك سوق الكل.
            </p>
            <Button onClick={() => navigate("/")}>
              العودة للرئيسية
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">حذف الحساب والبيانات</h1>
            <p className="text-muted-foreground mt-1">إدارة بياناتك الشخصية وحذف حسابك</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowRight className="h-4 w-4" />
            الرئيسية
          </Button>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Data We Collect */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">البيانات التي نجمعها</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، المدينة</li>
                <li>• <strong>الإعلانات:</strong> جميع الإعلانات والصور المرفقة بها</li>
                <li>• <strong>الرسائل:</strong> المحادثات بين المستخدمين</li>
                <li>• <strong>المفضلة:</strong> قائمة الإعلانات المحفوظة</li>
                <li>• <strong>التقييمات:</strong> التقييمات والمراجعات المقدمة</li>
                
              </ul>
            </CardContent>
          </Card>

          {/* What Happens on Deletion */}
          <Card className="border-amber-500/30">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">ماذا يحدث عند حذف الحساب</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• سيتم حذف حسابك وجميع بياناتك الشخصية نهائياً</li>
                <li>• سيتم حذف جميع إعلاناتك وصورك</li>
                <li>• سيتم حذف جميع محادثاتك ورسائلك</li>
                <li>• سيتم حذف مفضلتك وتقييماتك</li>
                
                <li>• <strong className="text-destructive">هذا الإجراء لا يمكن التراجع عنه</strong></li>
              </ul>
            </CardContent>
          </Card>

          {/* Retention Period */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-foreground mb-3">مدة الاحتفاظ بالبيانات</h2>
              <p className="text-muted-foreground leading-relaxed">
                عند طلب حذف الحساب، يتم حذف جميع البيانات فوراً وبشكل نهائي من قاعدة البيانات. 
                لا نحتفظ بأي نسخ احتياطية لبيانات المستخدمين المحذوفة بعد عملية الحذف.
              </p>
            </CardContent>
          </Card>

          {/* Delete Action */}
          <Card className="border-destructive/30">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-destructive flex items-center gap-2 mb-4">
                <Trash2 className="h-5 w-5" />
                حذف الحساب نهائياً
              </h2>

              {!user ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    يجب تسجيل الدخول أولاً لحذف حسابك
                  </p>
                  <Button onClick={() => navigate("/auth")} variant="outline">
                    <LogIn className="h-4 w-4" />
                    تسجيل الدخول
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    اكتب <span className="font-bold text-destructive">"حذف حسابي"</span> في الحقل أدناه للتأكيد:
                  </p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="حذف حسابي"
                    className="max-w-sm border-destructive/30"
                  />
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting || confirmText !== "حذف حسابي"}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    حذف حسابي نهائياً
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-lg font-bold text-foreground mb-2">هل تحتاج مساعدة؟</h2>
              <p className="text-muted-foreground">
                إذا كنت تواجه مشكلة في حذف حسابك، يرجى التواصل معنا عبر صفحة{" "}
                <button onClick={() => navigate("/contact")} className="text-primary underline">اتصل بنا</button>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DeleteData;
