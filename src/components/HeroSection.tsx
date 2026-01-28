import { Search, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const HeroSection = () => {
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
            اشتري وبيع <span className="text-primary">كل شيء</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            أكبر سوق إلكتروني مفتوح - آلاف الإعلانات الجديدة يومياً
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card-hover animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ماذا تبحث عنه؟"
                  className="pr-12 h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="المدينة أو المنطقة"
                  className="pr-12 h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="hero" size="lg">
                <Search className="h-5 w-5" />
                بحث
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+50K</div>
              <div className="text-primary-foreground/70 text-sm">إعلان نشط</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+100K</div>
              <div className="text-primary-foreground/70 text-sm">مستخدم</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+20</div>
              <div className="text-primary-foreground/70 text-sm">تصنيف</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
