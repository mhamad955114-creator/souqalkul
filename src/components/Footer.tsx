import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImage from "@/assets/logo.png";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoImage} alt={t.appName} className="h-10 w-10 rounded-xl object-contain" />
              <span className="text-xl font-bold">{t.appName}</span>
            </div>
            <p className="text-background/70 mb-6 leading-relaxed">
              {t.footer.aboutDesc}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-3">
              <li><a href="/" className="text-background/70 hover:text-primary transition-colors">{t.nav.home}</a></li>
              <li><a href="/listings" className="text-background/70 hover:text-primary transition-colors">{t.nav.categories}</a></li>
              <li><a href="/pricing" className="text-background/70 hover:text-primary transition-colors">{t.nav.offers}</a></li>
              <li><a href="/my-account" className="text-background/70 hover:text-primary transition-colors">{t.nav.myAccount}</a></li>
              <li><a href="/favorites" className="text-background/70 hover:text-primary transition-colors">{t.nav.favorites}</a></li>
              <li><a href="/about" className="text-background/70 hover:text-primary transition-colors">{t.aboutUs.title}</a></li>
              <li><a href="/contact" className="text-background/70 hover:text-primary transition-colors">{t.contactForm.title}</a></li>
              <li>
                <a href="/install" className="text-background/70 hover:text-primary transition-colors flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  تثبيت التطبيق
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    const url = 'https://swkalkillcom.lovable.app';
                    if (typeof navigator.share === 'function') {
                      navigator.share({
                        title: 'سوق الكل',
                        text: 'تطبيق سوق الكل - أفضل سوق إلكتروني للبيع والشراء',
                        url: url,
                      });
                    } else {
                      navigator.clipboard.writeText(url).then(() => {
                        toast.success('تم نسخ رابط التطبيق');
                      });
                    }
                  }}
                  className="text-background/70 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Share2 className="h-4 w-4" />
                  مشاركة التطبيق
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t.footer.categoriesTitle}</h3>
            <ul className="space-y-3">
              <li><a href="/listings?category=سيارات" className="text-background/70 hover:text-primary transition-colors">{t.categories.cars}</a></li>
              <li><a href="/listings?category=عقارات" className="text-background/70 hover:text-primary transition-colors">{t.categories.realEstate}</a></li>
              <li><a href="/listings?category=الكترونيات" className="text-background/70 hover:text-primary transition-colors">{t.categories.electronics}</a></li>
              <li><a href="/listings?category=أثاث" className="text-background/70 hover:text-primary transition-colors">{t.categories.furniture}</a></li>
              <li><a href="/listings?category=خدمات" className="text-background/70 hover:text-primary transition-colors">{t.categories.services}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t.footer.contactUs}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <a href="mailto:swqalkl0@gmail.com" className="text-background/70 hover:text-primary transition-colors">swqalkl0@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-background/70">920000000</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-background/70">Damascus, Syria</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/50 text-sm">
              {t.footer.rights}
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="text-background/50 hover:text-primary text-sm transition-colors">
                {t.footer.privacy}
              </a>
              <a href="/terms" className="text-background/50 hover:text-primary text-sm transition-colors">
                {t.footer.terms}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
