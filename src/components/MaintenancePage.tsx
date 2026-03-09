import { Construction, Wrench, Clock } from "lucide-react";
import { useBrand } from "@/contexts/BrandContext";

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage = ({ message = "الموقع تحت الصيانة حالياً، سنعود قريباً!" }: MaintenancePageProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logoImage} alt="سوق الكل" className="h-20 w-20 rounded-2xl object-contain" />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Construction className="h-12 w-12 text-primary animate-bounce" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-accent" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">جاري الصيانة</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{message}</p>
        </div>

        {/* Timer hint */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground/70 text-sm">
          <Clock className="h-4 w-4" />
          <span>نعمل على إعادة الخدمة في أسرع وقت</span>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 pt-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
