import { Search, Plus, User, Menu, LogOut, FileText, ShoppingBag, Heart, MessageCircle, Shield, Moon, Sun, Wallet, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useBrand } from "@/contexts/BrandContext";
import NotificationsDropdown from "./NotificationsDropdown";
import { Button } from "./ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import AddListingModal from "./AddListingModal";
import LanguageSwitcher from "./LanguageSwitcher";
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
  const [addListingModalOpen, setAddListingModalOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const { isAdmin } = useAdminRole();
  const { t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { logoUrl } = useBrand();

  const handleAddListing = () => {
    if (user) {
      setAddListingModalOpen(true);
    } else {
      navigate("/auth");
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
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={logoUrl} alt={t.appName} className="h-10 w-10 rounded-xl object-contain" />
              <span className="text-lg font-bold text-foreground">{t.appName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                {t.nav.home}
              </a>
              <a href="/listings" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                {t.nav.categories}
              </a>
              <a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                {t.nav.offers}
              </a>
              <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                {t.nav.contact}
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} title={t.settings.theme}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <LanguageSwitcher />

              {user && <NotificationsDropdown />}

              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="h-5 w-5" />
              </Button>

              {!loading && (
                <>
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hidden md:flex relative">
                          <User className="h-5 w-5" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
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
                          {t.nav.myListings}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/my-orders")} className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          {t.nav.myOrders}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/wallet")} className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          محفظتي
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/favorites")} className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          {t.nav.favorites}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/messages")} className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          {t.nav.messages}
                          {unreadCount > 0 && (
                            <span className={`${dir === "rtl" ? "mr-auto" : "ml-auto"} bg-destructive text-destructive-foreground text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1`}>
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/admin/reports")} className="flex items-center gap-2 text-primary">
                              <Shield className="h-4 w-4" />
                              {t.nav.adminPanel}
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                          <LogOut className="h-4 w-4" />
                          {t.nav.signOut}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex"
                      onClick={() => navigate("/auth")}
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  )}
                </>
              )}

              <Button variant="default" className="hidden md:flex" onClick={handleAddListing}>
                <Plus className="h-4 w-4" />
                {t.nav.addListing}
              </Button>

              {/* Mobile Share App Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
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
              >
                <Share2 className="h-5 w-5" />
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
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                  {t.nav.home}
                </a>
                <a href="/listings" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                  {t.nav.categories}
                </a>
                <a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                  {t.nav.offers}
                </a>
                <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                  {t.nav.contact}
                </a>
                {user ? (
                  <>
                    <div className="py-2 text-muted-foreground text-sm truncate">
                      {user.email}
                    </div>
                    <Button variant="outline" onClick={() => navigate("/my-account")}>
                      <FileText className="h-4 w-4" />
                      {t.nav.myListings}
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/wallet")}>
                      <Wallet className="h-4 w-4" />
                      محفظتي
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/my-orders")}>
                      <ShoppingBag className="h-4 w-4" />
                      {t.nav.myOrders}
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/favorites")}>
                      <Heart className="h-4 w-4" />
                      {t.nav.favorites}
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/messages")} className="relative">
                      <MessageCircle className="h-4 w-4" />
                      {t.nav.messages}
                      {unreadCount > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" onClick={() => navigate("/admin/reports")} className="text-primary">
                        <Shield className="h-4 w-4" />
                        {t.nav.adminPanel}
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      {t.nav.signOut}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => navigate("/auth")}>
                    <User className="h-4 w-4" />
                    {t.nav.signIn}
                  </Button>
                )}
                <Button variant="default" className="mt-2" onClick={handleAddListing}>
                  <Plus className="h-4 w-4" />
                  {t.nav.addListing}
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <AddListingModal
        isOpen={addListingModalOpen}
        onClose={() => setAddListingModalOpen(false)}
        onSuccess={() => onListingAdded?.()}
      />
    </>
  );
};

export default Header;
