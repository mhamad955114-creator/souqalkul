import { Link } from "react-router-dom";
import {
  Github,
  PlayCircle,
  Download,
  CheckCircle2,
  AlertTriangle,
  Package,
  Rocket,
  Smartphone,
  KeyRound,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("تم النسخ");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group" dir="ltr">
      <pre className="bg-muted/60 border border-border rounded-xl p-3 pr-12 text-xs overflow-x-auto font-mono text-foreground">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background border border-border transition"
        aria-label="نسخ"
      >
        {copied ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};

const Step = ({
  num,
  icon: Icon,
  title,
  children,
}: {
  num: number;
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="p-5 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">الخطوة {num}</p>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
    </div>
    <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
      {children}
    </div>
  </Card>
);

const BuildApkGuide = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            دليل بناء تطبيق Android (APK / AAB)
          </h1>
          <p className="text-sm text-muted-foreground">
            خطوات تفصيلية لبناء ملف التطبيق ورفعه إلى متجر Google Play باستخدام
            GitHub Actions الجاهز في المشروع.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Badge variant="secondary">APK</Badge>
            <Badge variant="secondary">AAB</Badge>
            <Badge variant="secondary">GitHub Actions</Badge>
            <Badge variant="secondary">Capacitor</Badge>
          </div>
        </div>

        {/* APK vs AAB */}
        <Card className="p-5">
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            الفرق بين APK و AAB
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-border rounded-xl p-3 space-y-1">
              <p className="font-semibold text-foreground text-sm">APK</p>
              <p className="text-xs text-muted-foreground">
                ملف تثبيت مباشر يمكن مشاركته وتثبيته على أي جهاز Android بدون
                المتجر. مناسب للتجربة والتوزيع المباشر.
              </p>
            </div>
            <div className="border-2 border-primary/30 bg-primary/5 rounded-xl p-3 space-y-1">
              <p className="font-semibold text-foreground text-sm">
                AAB <Badge className="text-[10px] mr-1">مطلوب للمتجر</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                صيغة Google Play الإلزامية للنشر. أصغر حجمًا ويُولّد APK مخصص
                لكل جهاز تلقائيًا.
              </p>
            </div>
          </div>
        </Card>

        {/* Pre-requisites */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>قبل البدء</AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-1">
            <p>• حساب GitHub (مجاني).</p>
            <p>• ربط مشروع Lovable بمستودع GitHub من زر GitHub أعلى المحرّر.</p>
            <p>• لا تحتاج لتثبيت Android Studio على جهازك — البناء يتم على خوادم GitHub.</p>
          </AlertDescription>
        </Alert>

        {/* Steps */}
        <div className="space-y-4">
          <Step num={1} icon={Github} title="ربط المشروع بـ GitHub">
            <p>
              من داخل Lovable: اضغط زر <strong>GitHub</strong> أعلى يمين الشاشة
              ← <strong>Connect to GitHub</strong> ← <strong>Create Repository</strong>.
            </p>
            <p>
              سيتم إنشاء مستودع جديد ونسخ كود المشروع إليه تلقائيًا، بما فيه
              ملف workflow الجاهز:
            </p>
            <CodeBlock code=".github/workflows/build-apk.yml" />
          </Step>

          <Step num={2} icon={PlayCircle} title="تشغيل عملية البناء">
            <ol className="list-decimal pr-4 space-y-1">
              <li>افتح المستودع على github.com</li>
              <li>اذهب إلى تبويب <strong>Actions</strong></li>
              <li>اختر <strong>Build APK & AAB</strong> من القائمة الجانبية</li>
              <li>اضغط <strong>Run workflow</strong> ← الزر الأخضر <strong>Run workflow</strong></li>
              <li>انتظر اكتمال العلامة الخضراء ✅ (10–15 دقيقة)</li>
            </ol>
          </Step>

          <Step num={3} icon={Download} title="تنزيل الملفات الجاهزة">
            <p>بعد اكتمال البناء، الملفات تظهر في مكانين:</p>

            <div className="space-y-2 mt-2">
              <div className="border border-border rounded-lg p-3">
                <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-primary" />
                  Releases (الأسهل والمُوصى به)
                </p>
                <p className="text-xs mt-1">
                  افتح الصفحة الرئيسية للمستودع ← قسم <strong>Releases</strong> على
                  اليمين ← آخر إصدار بعنوان <em>"إصدار رقم #"</em>. ستجد:
                </p>
                <ul className="text-xs list-disc pr-4 mt-1 space-y-0.5">
                  <li><code>souqalkul.apk</code> — للتثبيت المباشر</li>
                  <li><code>souqalkul.aab</code> — للرفع على Google Play</li>
                </ul>
              </div>

              <div className="border border-border rounded-lg p-3">
                <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Artifacts (بديل)
                </p>
                <p className="text-xs mt-1">
                  من تبويب <strong>Actions</strong> ← اضغط على آخر بناء ناجح ← اسحب
                  للأسفل إلى قسم <strong>Artifacts</strong>. ستجد:
                </p>
                <ul className="text-xs list-disc pr-4 mt-1 space-y-0.5">
                  <li><code>app-release-apk</code></li>
                  <li><code>app-release-aab</code></li>
                </ul>
                <p className="text-[11px] text-muted-foreground mt-1">
                  ⚠️ ملفات Artifacts تُحذف تلقائيًا بعد 90 يومًا.
                </p>
              </div>
            </div>
          </Step>

          <Step num={4} icon={Smartphone} title="تثبيت APK على جهازك">
            <ol className="list-decimal pr-4 space-y-1">
              <li>انقل ملف <code>souqalkul.apk</code> إلى الهاتف</li>
              <li>افتح إعدادات الهاتف ← الأمان ← فعّل <strong>السماح بالتثبيت من مصادر غير معروفة</strong></li>
              <li>اضغط على ملف APK لتثبيته</li>
            </ol>
          </Step>

          <Step num={5} icon={Rocket} title="رفع AAB إلى Google Play">
            <ol className="list-decimal pr-4 space-y-1">
              <li>افتح <a className="text-primary underline" href="https://play.google.com/console" target="_blank" rel="noopener noreferrer">Google Play Console</a></li>
              <li>اختر تطبيقك ← <strong>Production</strong> أو <strong>Internal testing</strong></li>
              <li>اضغط <strong>Create new release</strong></li>
              <li>ارفع ملف <code>souqalkul.aab</code> في قسم <strong>App bundles</strong></li>
              <li>أضف ملاحظات الإصدار ← <strong>Save</strong> ← <strong>Review release</strong> ← <strong>Rollout</strong></li>
            </ol>
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                تذكّر زيادة <code>versionCode</code> و <code>versionName</code> في
                <code className="mx-1">android/app/build.gradle</code> قبل كل بناء جديد للنشر.
              </AlertDescription>
            </Alert>
          </Step>

          <Step num={6} icon={KeyRound} title="(اختياري) توقيع الإصدار بمفتاح خاص">
            <p>
              حاليًا الـ workflow يستخدم <strong>توقيع تجريبي (debug)</strong> مناسب
              للتجربة فقط. لرفع التطبيق على Google Play تحتاج توقيعه بمفتاح
              <strong> release</strong> ثابت.
            </p>
            <p>الخيار الأسهل: استخدم <strong>Play App Signing</strong> من Google Play Console (يتولى Google التوقيع نيابة عنك).</p>
          </Step>

          <Step num={7} icon={RefreshCw} title="التحديث الهوائي بدون بناء جديد">
            <p>
              المشروع يدعم <strong>Capgo OTA</strong>: عند تعديل الواجهة من Lovable
              ورفع حزمة جديدة إلى Capgo، يستلم المستخدمون التحديث داخل التطبيق
              مباشرة بدون الحاجة إلى APK جديد.
            </p>
            <p>تحتاج بناء APK جديد فقط في الحالات التالية:</p>
            <ul className="list-disc pr-4 text-xs space-y-0.5">
              <li>تحديث إضافات Capacitor الأصلية</li>
              <li>تغيير الأيقونة أو شاشة البداية</li>
              <li>تغيير الصلاحيات في <code>AndroidManifest.xml</code></li>
              <li>تغيير <code>versionCode</code> للنشر على المتجر</li>
            </ul>
          </Step>
        </div>

        {/* Troubleshooting */}
        <Card className="p-5 space-y-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            استكشاف المشاكل الشائعة
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-foreground">❌ فشل البناء في خطوة Gradle</p>
              <p className="text-xs text-muted-foreground">
                افتح سجل البناء في Actions، ابحث عن أول سطر <code>FAILURE</code>.
                غالبًا يكون السبب نسخة Java أو ذاكرة غير كافية. أعد تشغيل
                الـ workflow.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">❌ التطبيق يفتح شاشة بيضاء</p>
              <p className="text-xs text-muted-foreground">
                تأكد أن <code>npm run build</code> اكتمل بدون أخطاء قبل خطوة
                <code> Prepare Android web assets</code>، وأن مجلد <code>dist</code> موجود.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">❌ Google Play يرفض الـ AAB</p>
              <p className="text-xs text-muted-foreground">
                السبب الأكثر شيوعًا: التوقيع تجريبي. فعّل توقيع release كما في
                الخطوة 6، أو اعتمد على Play App Signing.
              </p>
            </div>
          </div>
        </Card>

        {/* Quick links */}
        <Card className="p-5 space-y-2">
          <h2 className="font-bold text-foreground">روابط مفيدة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="https://docs.lovable.dev/integrations/github"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border hover:border-primary/40 transition text-sm"
            >
              <span>دليل GitHub في Lovable</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href="https://play.google.com/console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border hover:border-primary/40 transition text-sm"
            >
              <span>Google Play Console</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href="https://capacitorjs.com/docs/android"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border hover:border-primary/40 transition text-sm"
            >
              <span>توثيق Capacitor Android</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href="https://capgo.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border hover:border-primary/40 transition text-sm"
            >
              <span>Capgo (التحديث الهوائي)</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </Card>

        <div className="flex justify-center pt-2">
          <Button asChild variant="outline">
            <Link to="/developers">العودة لصفحة المطورين</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuildApkGuide;
