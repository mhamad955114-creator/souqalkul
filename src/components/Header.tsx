import { Search, Plus, User, Menu, LogOut, FileText, ShoppingBag, Heart, MessageCircle, Shield, Moon, Sun, Crown, Receipt, Bot } from "lucide-react";
import ShareButtons from "./ShareButtons";
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
import { useCountry } from "@/contexts/CountryContext";
import { countries } from "@/lib/constants";
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
  const { currentCountry, setCountry } = useCountry();

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
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img src={logoUrl} alt={t.appName} className="h-14 w-14 rounded-xl object-contain sm:h-16 sm:w-16" />
              <span className="text-xl font-bold text-foreground sm:text-2xl">{t.appName}</span>
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
            <div className="flex items-center gap-1 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 text-primary"
                onClick={() => navigate("/ai")}
                title="المساعد الذكي"
              >
                <Bot className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={toggleTheme} title={t.settings.theme}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>


              <LanguageSwitcher />

              {/* Country Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-2 text-xs gap-1">
                    <span>🌍</span>
                    <span className="hidden sm:inline">{currentCountry.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                  {countries.map((c) => (
                    <DropdownMenuItem
                      key={c.code}
                      onClick={() => setCountry(c.name)}
                      className={currentCountry.code === c.code ? "bg-primary/10 font-bold" : ""}
                    >
                      {c.name} ({c.currencySymbol})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>


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
              <div className="md:hidden">
                <ShareButtons
                  url="https://play.google.com/store/apps/details?id=app.souqalkul"
                  title="سوق الكل - أفضل سوق إلكتروني"
                  description="حمّل تطبيق سوق الكل للبيع والشراء"
                  variant="icon"
                />
              </div>

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
