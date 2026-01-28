import { Search, Plus, User, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">س</span>
            </div>
            <span className="text-xl font-bold text-foreground">السوق المفتوح</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              الرئيسية
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              التصنيفات
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              العروض
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              تواصل معنا
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="default" className="hidden md:flex">
              <Plus className="h-4 w-4" />
              أضف إعلانك
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-up">
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                الرئيسية
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                التصنيفات
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                العروض
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                تواصل معنا
              </a>
              <Button variant="default" className="mt-2">
                <Plus className="h-4 w-4" />
                أضف إعلانك
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
