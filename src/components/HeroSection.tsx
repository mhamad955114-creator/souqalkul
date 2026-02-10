import { Search, MapPin, Loader2, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const [locationValue, setLocationValue] = useState("");
  const { loading: geoLoading, detectLocation } = useGeolocation();
  const { t, dir } = useLanguage();

  const handleDetectLocation = async () => {
    const result = await detectLocation();
    if (result) {
      setLocationValue(result.city);
    }
  };

  return (
    <section className="relative gradient-hero text-primary-foreground py-16 md:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up">
            {t.hero.title1}<span className="text-primary">{t.hero.titleHighlight}</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {t.hero.subtitle}
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card-hover animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                <Input
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  className={`${dir === "rtl" ? "pr-12" : "pl-12"} h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground`}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                <Input
                  type="text"
                  placeholder={t.hero.locationPlaceholder}
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  className={`${dir === "rtl" ? "pr-12 pl-12" : "pl-12 pr-12"} h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground`}
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={geoLoading}
                  className={`absolute ${dir === "rtl" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors`}
                  title={t.hero.detectLocation}
                >
                  {geoLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}
                </button>
              </div>
              <Button variant="hero" size="lg">
                <Search className="h-5 w-5" />
                {t.hero.search}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+50K</div>
              <div className="text-primary-foreground/70 text-sm">{t.hero.activeAds}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+100K</div>
              <div className="text-primary-foreground/70 text-sm">{t.hero.users}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+20</div>
              <div className="text-primary-foreground/70 text-sm">{t.hero.categoriesCount}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
