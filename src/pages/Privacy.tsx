import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Shield, Database, Share2, Lock, Cookie, UserCheck, Mail, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const sections = [
    { icon: Database, title: t.privacy.dataCollectionTitle, desc: t.privacy.dataCollectionDesc },
    { icon: Shield, title: t.privacy.dataUsageTitle, desc: t.privacy.dataUsageDesc },
    { icon: Share2, title: t.privacy.dataSharingTitle, desc: t.privacy.dataSharingDesc },
    { icon: Lock, title: t.privacy.dataProtectionTitle, desc: t.privacy.dataProtectionDesc },
    { icon: Cookie, title: t.privacy.cookiesTitle, desc: t.privacy.cookiesDesc },
    { icon: UserCheck, title: t.privacy.userRightsTitle, desc: t.privacy.userRightsDesc },
    { icon: Trash2, title: "حذف البيانات", desc: "يحق لك طلب حذف جميع بياناتك الشخصية في أي وقت. عند حذف حسابك، سيتم إزالة جميع بياناتك بشكل نهائي بما في ذلك الإعلانات، الرسائل، المفضلة، التقييمات، ورصيد المحفظة. يمكنك حذف حسابك من صفحة حسابي أو من صفحة حذف البيانات المخصصة." },
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.privacy.title}</h1>
            <p className="text-muted-foreground mt-1">{t.privacy.subtitle}</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            <BackArrow className="h-4 w-4" />
            {t.privacy.back}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground mb-4">{t.privacy.lastUpdated}</p>
              <p className="text-muted-foreground leading-relaxed text-lg">{t.privacy.intro}</p>
            </CardContent>
          </Card>

          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{section.desc}</p>
              </CardContent>
            </Card>
          ))}

          <Card className="border-primary/20">
            <CardContent className="p-8 text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-2">{t.privacy.contactTitle}</h2>
              <p className="text-muted-foreground">{t.privacy.contactDesc}</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
