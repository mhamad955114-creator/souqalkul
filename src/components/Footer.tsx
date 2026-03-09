import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Download, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContactSettings, buildWhatsAppUrl } from "@/hooks/useContactSettings";
import logoImage from "@/assets/logo.png";

const Footer = () => {
  const { t } = useLanguage();
  const { contact, social } = useContactSettings();

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
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.04 4.41-2.61 6.01-1.58 1.61-3.9 2.58-6.2 2.45-2.18-.11-4.29-1.2-5.61-2.91-1.3-1.7-1.83-3.95-1.5-6.08.3-2.07 1.48-4 3.12-5.32 1.62-1.28 3.78-1.89 5.86-1.66v4.06c-1.17-.3-2.51-.12-3.48.65-.96.76-1.48 2.01-1.32 3.2.14 1.25.99 2.37 2.12 2.89 1.12.51 2.5.49 3.55-.17 1.05-.66 1.66-1.87 1.69-3.13.06-4.52.02-9.05.03-13.57.01-1.07.01-2.14.01-3.21Z"/></svg>
                </a>
              )}
              {social.snapchat && (
                <a href={social.snapchat} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-[#FFFC00] hover:text-black transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.246.133-.065.262-.089.397-.089.345 0 .628.211.735.39.089.151.135.39-.074.614-.196.21-.533.39-.838.502-.307.115-.632.193-.903.246-.145.03-.287.045-.374.06l-.006.001c-.052.009-.091.015-.122.024-.09.03-.193.09-.24.21a.67.67 0 0 0-.015.39c.473 1.545 1.47 2.749 2.422 3.315.256.149.48.27.556.39.18.285.03.63-.15.81-.255.24-.616.42-.988.555-.485.18-.965.27-1.455.36-.18.03-.285.15-.33.27-.045.12-.06.27-.09.42-.045.195-.09.39-.225.555-.18.21-.48.315-.795.315-.195 0-.42-.045-.66-.105-.36-.09-.81-.21-1.395-.21-.27 0-.555.03-.84.09-.795.18-1.41.72-2.07 1.305-.42.375-.855.75-1.395 1.02-.255.12-.54.21-.84.21s-.585-.09-.84-.21c-.54-.27-.975-.645-1.395-1.02-.66-.585-1.275-1.125-2.07-1.305a4.14 4.14 0 0 0-.84-.09c-.585 0-1.035.12-1.395.21-.24.06-.465.105-.66.105-.315 0-.615-.105-.795-.315-.135-.165-.18-.36-.225-.555-.03-.15-.045-.3-.09-.42-.045-.12-.15-.24-.33-.27-.49-.09-.97-.18-1.455-.36-.375-.135-.735-.315-.99-.555-.18-.18-.33-.525-.15-.81.075-.12.3-.24.555-.39.955-.565 1.95-1.77 2.425-3.315a.67.67 0 0 0-.015-.39c-.045-.12-.15-.18-.24-.21-.03-.009-.07-.015-.12-.024l-.007-.001c-.087-.015-.229-.03-.374-.06-.27-.053-.596-.131-.903-.246-.305-.113-.642-.292-.838-.503-.209-.224-.163-.463-.074-.614.107-.179.39-.39.735-.39.135 0 .264.024.397.09.265.126.622.233.922.246.197 0 .326-.045.4-.09a43.33 43.33 0 0 1-.032-.57c-.104-1.628-.23-3.654.3-4.847C7.46 1.07 10.816.793 11.806.793h.4z"/></svg>
                </a>
              )}
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
                <a
                  href={`mailto:${contact.email}`}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-background/70 hover:text-primary transition-colors"
                  dir="ltr"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <a
                  href={buildWhatsAppUrl(contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
                <a
                  href={buildWhatsAppUrl(contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-green-400 transition-colors"
                  dir="ltr"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-background/70">{contact.location}</span>
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
