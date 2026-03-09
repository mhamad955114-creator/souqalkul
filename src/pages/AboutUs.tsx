import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContactSettings } from "@/hooks/useContactSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Users, Target, Eye, Shield, Zap, Globe, HeadphonesIcon, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AboutUs = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const features = [
    { icon: Zap, title: t.aboutUs.feature1Title, desc: t.aboutUs.feature1Desc },
    { icon: Shield, title: t.aboutUs.feature2Title, desc: t.aboutUs.feature2Desc },
    { icon: Globe, title: t.aboutUs.feature3Title, desc: t.aboutUs.feature3Desc },
    { icon: HeadphonesIcon, title: t.aboutUs.feature4Title, desc: t.aboutUs.feature4Desc },
  ];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.aboutUs.title}</h1>
            <p className="text-muted-foreground mt-1">{t.aboutUs.subtitle}</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            <BackArrow className="h-4 w-4" />
            {t.aboutUs.back}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-10">
          {/* Who We Are */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t.aboutUs.whoWeAre}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t.aboutUs.whoWeAreDesc}
              </p>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{t.aboutUs.ourMission}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t.aboutUs.ourMissionDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{t.aboutUs.ourVision}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t.aboutUs.ourVisionDesc}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose Us */}
          <div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              {t.aboutUs.whyChooseUs}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <feature.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team */}
          <Card className="gradient-hero text-primary-foreground">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-bold mb-3">{t.aboutUs.teamTitle}</h2>
              <p className="opacity-90 leading-relaxed max-w-2xl mx-auto">
                {t.aboutUs.teamDesc}
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">{t.aboutUs.contactTitle}</h2>
              <p className="text-muted-foreground mb-4">{t.aboutUs.contactDesc}</p>
              <a
                href={`mailto:${t.aboutUs.contactEmail}`}
                className="text-primary font-semibold hover:underline text-lg"
              >
                {t.aboutUs.contactEmail}
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
