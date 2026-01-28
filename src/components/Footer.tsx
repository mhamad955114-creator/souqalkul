import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">س</span>
              </div>
              <span className="text-xl font-bold">السوق المفتوح</span>
            </div>
            <p className="text-background/70 mb-6 leading-relaxed">
              أكبر سوق إلكتروني مفتوح للبيع والشراء. نربط البائعين والمشترين في مكان واحد بكل سهولة وأمان.
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
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">الرئيسية</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">التصنيفات</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">أضف إعلانك</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">حسابي</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">المفضلة</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">التصنيفات</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">سيارات</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">عقارات</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">إلكترونيات</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">أثاث</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">خدمات</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-background/70">support@opensouq.com</span>
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
                <span className="text-background/70">الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/50 text-sm">
              © 2024 السوق المفتوح. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-background/50 hover:text-primary text-sm transition-colors">
                سياسة الخصوصية
              </a>
              <a href="#" className="text-background/50 hover:text-primary text-sm transition-colors">
                الشروط والأحكام
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
