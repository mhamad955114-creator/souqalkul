import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Eye, ListChecks, Pencil } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocationConsentDialogProps {
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
  onManual?: () => void;
}

const COPY = {
  ar: {
    title: "السماح بالوصول إلى موقعك؟",
    desc: "نستخدم موقعك مرة واحدة لتعبئة حقول الدولة والمدينة والمنطقة تلقائيًا في إعلانك.",
    bullets: [
      "لن يتم تخزين إحداثياتك على خوادمنا.",
      "يُستخدم الموقع فقط أثناء إنشاء الإعلان.",
      "يمكنك الإدخال يدويًا بدلاً من ذلك في أي وقت.",
    ],
    allow: "السماح بالوصول",
    deny: "ليس الآن",
    manual: "إدخال يدوي",
  },
  en: {
    title: "Allow access to your location?",
    desc: "We use your location once to auto-fill the country, city and area fields of your listing.",
    bullets: [
      "Your coordinates are never stored on our servers.",
      "Used only while creating the listing.",
      "You can always enter your location manually instead.",
    ],
    allow: "Allow access",
    deny: "Not now",
    manual: "Enter manually",
  },
  tr: {
    title: "Konumunuza erişime izin verilsin mi?",
    desc: "Konumunuzu yalnızca ilanınızdaki ülke, şehir ve bölge alanlarını otomatik doldurmak için kullanırız.",
    bullets: [
      "Koordinatlarınız sunucularımızda saklanmaz.",
      "Yalnızca ilan oluşturulurken kullanılır.",
      "Dilediğiniz zaman manuel giriş yapabilirsiniz.",
    ],
    allow: "İzin ver",
    deny: "Şimdi değil",
    manual: "Elle gir",
  },
} as const;

export function LocationConsentDialog({ open, onAllow, onDeny, onManual }: LocationConsentDialogProps) {
  const { language } = useLanguage();
  const t = COPY[(language as keyof typeof COPY)] || COPY.ar;
  const icons = [Shield, Eye, ListChecks];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDeny()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{t.title}</DialogTitle>
          <DialogDescription className="text-center">{t.desc}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 py-2">
          {t.bullets.map((b, i) => {
            const Icon = icons[i] ?? Shield;
            return (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{b}</span>
              </li>
            );
          })}
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2">
          <Button className="w-full" onClick={onAllow}>
            {t.allow}
          </Button>
          {onManual && (
            <Button variant="secondary" className="w-full gap-2" onClick={onManual}>
              <Pencil className="h-4 w-4" />
              {t.manual}
            </Button>
          )}
          <Button variant="ghost" className="w-full" onClick={onDeny}>
            {t.deny}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
