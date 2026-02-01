import { Search, Plus, User, Menu, LogOut, FileText, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "./AuthModal";
import AddListingModal from "./AddListingModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  onListingAdded?: () => void;
}

const Header = ({ onListingAdded }: HeaderProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [addListingModalOpen, setAddListingModalOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const openAuthModal = (tab: "login" | "signup") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleAddListing = () => {
    if (user) {
      setAddListingModalOpen(true);
    } else {
      openAuthModal("login");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
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

              {!loading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hidden md:flex">
                          <User className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="truncate">{user.email}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/my-account")} className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          إعلاناتي
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/my-orders")} className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          طلباتي
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                          <LogOut className="h-4 w-4" />
                          تسجيل الخروج
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex"
                      onClick={() => openAuthModal("login")}
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  )}
                </>
              )}

              <Button variant="default" className="hidden md:flex" onClick={handleAddListing}>
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
                {user ? (
                  <>
                    <div className="py-2 text-muted-foreground text-sm truncate">
                      {user.email}
                    </div>
                    <Button variant="outline" onClick={() => navigate("/my-account")}>
                      <FileText className="h-4 w-4" />
                      إعلاناتي
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/my-orders")}>
                      <ShoppingBag className="h-4 w-4" />
                      طلباتي
                    </Button>
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => openAuthModal("login")}>
                    <User className="h-4 w-4" />
                    تسجيل الدخول
                  </Button>
                )}
                <Button variant="default" className="mt-2" onClick={handleAddListing}>
                  <Plus className="h-4 w-4" />
                  أضف إعلانك
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      <AddListingModal
        isOpen={addListingModalOpen}
        onClose={() => setAddListingModalOpen(false)}
        onSuccess={() => onListingAdded?.()}
      />
    </>
  );
};

export default Header;
