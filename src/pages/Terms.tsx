import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, FileCheck, UserCog, ScrollText, Ban, AlertTriangle, XCircle, RefreshCw, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const sections = [
    { icon: FileCheck, title: t.terms.acceptanceTitle, desc: t.terms.acceptanceDesc },
    { icon: UserCog, title: t.terms.accountTitle, desc: t.terms.accountDesc },
    { icon: ScrollText, title: t.terms.listingRulesTitle, desc: t.terms.listingRulesDesc },
    { icon: Ban, title: t.terms.prohibitedTitle, desc: t.terms.prohibitedDesc },
    { icon: AlertTriangle, title: t.terms.liabilityTitle, desc: t.terms.liabilityDesc },
    { icon: XCircle, title: t.terms.terminationTitle, desc: t.terms.terminationDesc },
    { icon: RefreshCw, title: t.terms.changesTitle, desc: t.terms.changesDesc },
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.terms.title}</h1>
            <p className="text-muted-foreground mt-1">{t.terms.subtitle}</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            <BackArrow className="h-4 w-4" />
            {t.terms.back}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground mb-4">{t.terms.lastUpdated}</p>
              <p className="text-muted-foreground leading-relaxed text-lg">{t.terms.intro}</p>
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
              <h2 className="text-lg font-bold text-foreground mb-2">{t.terms.contactTitle}</h2>
              <p className="text-muted-foreground">{t.terms.contactDesc}</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
