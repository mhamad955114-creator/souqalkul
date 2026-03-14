import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContactSettings, buildWhatsAppUrl } from "@/hooks/useContactSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Code2, Smartphone, Globe, Shield, Palette, Rocket, MessageCircle, Mail, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";

const Developers = () => {
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const { contact } = useContactSettings();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const skills = [
    { icon: Smartphone, title: "تطوير تطبيقات الجوال", desc: "تطبيقات أندرويد وiOS بتقنيات حديثة وأداء عالي" },
    { icon: Globe, title: "تطوير الويب", desc: "مواقع وتطبيقات ويب متجاوبة باستخدام React وأحدث التقنيات" },
    { icon: Shield, title: "أمان وحماية", desc: "تطبيق أفضل معايير الأمان وحماية بيانات المستخدمين" },
    { icon: Palette, title: "تصميم واجهات", desc: "واجهات مستخدم عصرية وسهلة الاستخدام مع تجربة سلسة" },
  ];

  const values = [
    { icon: Rocket, title: "الابتكار", desc: "نسعى دائماً لتقديم حلول مبتكرة تواكب أحدث التقنيات" },
    { icon: Heart, title: "الشغف", desc: "نؤمن بأن الشغف هو المحرك الأساسي لإنتاج برمجيات استثنائية" },
    { icon: Code2, title: "الجودة", desc: "نلتزم بأعلى معايير جودة الكود والاختبار والتوثيق" },
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <BackArrow className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">فريق التطوير</h1>
            <p className="text-sm text-muted-foreground">الفريق الذي يقف خلف سوق الكل</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-primary to-primary/70 p-8 text-primary-foreground text-center">
              <Code2 className="h-14 w-14 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-3">نحن نبني المستقبل الرقمي</h2>
              <p className="opacity-90 max-w-2xl mx-auto leading-relaxed">
                فريق من المطورين المتحمسين والمبدعين، نعمل بشغف لتقديم أفضل تجربة رقمية للمستخدمين في سوريا والعالم العربي. نجمع بين الخبرة التقنية والإبداع لبناء منصات تُحدث فرقاً حقيقياً.
              </p>
            </div>
          </Card>

          {/* About the Team */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">من نحن؟</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                نحن فريق تطوير برمجيات متخصص في بناء التطبيقات والمنصات الرقمية. بدأنا رحلتنا بهدف تقديم حلول تقنية مبتكرة تلبي احتياجات السوق المحلي، وتطورنا لنصبح فريقاً قادراً على تنفيذ مشاريع متكاملة من التصميم وحتى النشر.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                تطبيق <strong className="text-foreground">سوق الكل</strong> هو أحد مشاريعنا التي نفخر بها — منصة إعلانات مبوبة شاملة صُممت لتكون سهلة وسريعة وآمنة، تخدم المستخدمين في البيع والشراء بأفضل تجربة ممكنة.
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
          <div>
            <h2 className="text-xl font-bold text-foreground text-center mb-6">خبراتنا التقنية</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {skills.map((skill, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <skill.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 text-sm">{skill.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{skill.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-xl font-bold text-foreground text-center mb-6">قيمنا</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {values.map((val, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <val.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{val.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{val.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-xl font-bold text-foreground mb-4">التقنيات التي نستخدمها</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {["React", "TypeScript", "Tailwind CSS", "Supabase", "Capacitor", "Node.js", "PostgreSQL", "Vite"].map((tech) => (
                  <span key={tech} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="border-primary/20">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">هل لديك مشروع؟</h2>
              <p className="text-muted-foreground mb-5 text-sm">
                نحن مستعدون لمساعدتك في تحويل فكرتك إلى تطبيق حقيقي. تواصل معنا الآن!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => {
                    const msg = "مرحباً، أرغب في التواصل مع فريق التطوير بخصوص مشروع";
                    window.open(buildWhatsAppUrl(contact.whatsapp, msg), "_blank");
                  }}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  تواصل عبر واتساب
                </Button>
                <Button variant="outline" onClick={() => navigate("/contact")} className="gap-2">
                  <Mail className="h-4 w-4" />
                  راسلنا
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Developers;